import { Account, Category, CategoryType, Expense, Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import { accountRepository } from "../repositories/accountRepository";
import { expenseRepository } from "../repositories/expenseRepository";
import { NotFoundError, ValidationError } from "../utils/errors";
import type {
  CreateExpenseBody,
  ListExpensesQuery,
  UpdateExpenseBody,
} from "../validators/expenseSchemas";

export type PublicExpense = {
  id: string;
  amount: string;
  merchant: string | null;
  description: string | null;
  notes: string | null;
  paymentMethod: Expense["paymentMethod"];
  tags: string[];
  transactionDate: Date;
  archivedAt: Date | null;
  accountId: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PaginatedExpenses = {
  expenses: PublicExpense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

function formatMoney(value: Prisma.Decimal | string | number): string {
  return new Prisma.Decimal(value).toFixed(2);
}

function toPublicExpense(expense: Expense): PublicExpense {
  return {
    id: expense.id,
    amount: formatMoney(expense.amount),
    merchant: expense.merchant,
    description: expense.description,
    notes: expense.notes,
    paymentMethod: expense.paymentMethod,
    tags: expense.tags,
    transactionDate: expense.transactionDate,
    archivedAt: expense.archivedAt,
    accountId: expense.accountId,
    categoryId: expense.categoryId,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
  };
}

async function requireOwnedExpense(id: string, userId: string): Promise<Expense> {
  const expense = await expenseRepository.findByIdForUser(id, userId);
  if (!expense) {
    throw new NotFoundError("Expense not found");
  }
  return expense;
}

async function requireActiveOwnedAccount(
  accountId: string,
  userId: string,
  tx?: Prisma.TransactionClient,
): Promise<Account> {
  const client = tx ?? prisma;
  const account = await client.account.findFirst({
    where: { id: accountId, userId },
  });
  if (!account) {
    throw new NotFoundError("Account not found");
  }
  if (account.archivedAt) {
    throw new ValidationError("Cannot use an archived account");
  }
  return account;
}

async function requireActiveExpenseCategory(
  categoryId: string,
  userId: string,
  tx?: Prisma.TransactionClient,
): Promise<Category> {
  const client = tx ?? prisma;
  const category = await client.category.findFirst({
    where: { id: categoryId, userId },
  });
  if (!category) {
    throw new NotFoundError("Category not found");
  }
  if (category.archivedAt) {
    throw new ValidationError("Cannot use an archived category");
  }
  if (category.type !== CategoryType.EXPENSE) {
    throw new ValidationError("Expense category must have type EXPENSE");
  }
  return category;
}

export const expenseService = {
  async list(userId: string, query: ListExpensesQuery): Promise<PaginatedExpenses> {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const filters = {
      userId,
      from: query.from,
      to: query.to,
      categoryId: query.categoryId,
      accountId: query.accountId,
      includeArchived: query.includeArchived ?? false,
    };

    const [expenses, total] = await Promise.all([
      expenseRepository.findManyForUser({ ...filters, skip, take: limit }),
      expenseRepository.countForUser(filters),
    ]);

    return {
      expenses: expenses.map(toPublicExpense),
      pagination: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  },

  async getById(userId: string, expenseId: string): Promise<PublicExpense> {
    const expense = await requireOwnedExpense(expenseId, userId);
    return toPublicExpense(expense);
  },

  async create(userId: string, input: CreateExpenseBody): Promise<PublicExpense> {
    const created = await prisma.$transaction(async (tx) => {
      await requireActiveOwnedAccount(input.accountId, userId, tx);
      await requireActiveExpenseCategory(input.categoryId, userId, tx);

      const expense = await expenseRepository.create(
        {
          userId,
          accountId: input.accountId,
          categoryId: input.categoryId,
          amount: input.amount,
          merchant: input.merchant,
          description: input.description,
          notes: input.notes,
          paymentMethod: input.paymentMethod,
          tags: input.tags,
          transactionDate: input.transactionDate,
        },
        tx,
      );

      await accountRepository.adjustBalance(
        input.accountId,
        new Prisma.Decimal(input.amount).negated(),
        tx,
      );

      return expense;
    });

    return toPublicExpense(created);
  },

  async update(
    userId: string,
    expenseId: string,
    input: UpdateExpenseBody,
  ): Promise<PublicExpense> {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.expense.findFirst({
        where: { id: expenseId, userId },
      });
      if (!existing) {
        throw new NotFoundError("Expense not found");
      }
      if (existing.archivedAt) {
        throw new ValidationError("Cannot update an archived expense");
      }

      const nextAccountId = input.accountId ?? existing.accountId;
      const nextAmount = input.amount ?? formatMoney(existing.amount);

      if (input.accountId) {
        await requireActiveOwnedAccount(input.accountId, userId, tx);
      }
      if (input.categoryId) {
        await requireActiveExpenseCategory(input.categoryId, userId, tx);
      }

      const amountChanged =
        input.amount !== undefined &&
        !new Prisma.Decimal(input.amount).equals(existing.amount);
      const accountChanged =
        input.accountId !== undefined && input.accountId !== existing.accountId;

      if (amountChanged || accountChanged) {
        await requireActiveOwnedAccount(nextAccountId, userId, tx);
        await accountRepository.adjustBalance(existing.accountId, existing.amount, tx);
        await accountRepository.adjustBalance(
          nextAccountId,
          new Prisma.Decimal(nextAmount).negated(),
          tx,
        );
      }

      return expenseRepository.update(
        existing.id,
        {
          accountId: input.accountId,
          categoryId: input.categoryId,
          amount: input.amount,
          merchant: input.merchant,
          description: input.description,
          notes: input.notes,
          paymentMethod: input.paymentMethod,
          tags: input.tags,
          transactionDate: input.transactionDate,
        },
        tx,
      );
    });

    return toPublicExpense(updated);
  },

  async archive(userId: string, expenseId: string): Promise<PublicExpense> {
    const archived = await prisma.$transaction(async (tx) => {
      const existing = await tx.expense.findFirst({
        where: { id: expenseId, userId },
      });
      if (!existing) {
        throw new NotFoundError("Expense not found");
      }
      if (existing.archivedAt) {
        return existing;
      }

      await accountRepository.adjustBalance(existing.accountId, existing.amount, tx);
      return expenseRepository.archive(existing.id, tx);
    });

    return toPublicExpense(archived);
  },

  async unarchive(userId: string, expenseId: string): Promise<PublicExpense> {
    const restored = await prisma.$transaction(async (tx) => {
      const existing = await tx.expense.findFirst({
        where: { id: expenseId, userId },
      });
      if (!existing) {
        throw new NotFoundError("Expense not found");
      }
      if (!existing.archivedAt) {
        return existing;
      }

      await requireActiveOwnedAccount(existing.accountId, userId, tx);
      await requireActiveExpenseCategory(existing.categoryId, userId, tx);

      await accountRepository.adjustBalance(
        existing.accountId,
        existing.amount.negated(),
        tx,
      );
      return expenseRepository.unarchive(existing.id, tx);
    });

    return toPublicExpense(restored);
  },
};
