import { Account, Category, CategoryType, Income, Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import { accountRepository } from "../repositories/accountRepository";
import { incomeRepository } from "../repositories/incomeRepository";
import { NotFoundError, ValidationError } from "../utils/errors";
import type {
  CreateIncomeBody,
  ListIncomesQuery,
  UpdateIncomeBody,
} from "../validators/incomeSchemas";

export type PublicIncome = {
  id: string;
  amount: string;
  source: string | null;
  description: string | null;
  notes: string | null;
  paymentMethod: Income["paymentMethod"];
  tags: string[];
  transactionDate: Date;
  archivedAt: Date | null;
  accountId: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PaginatedIncomes = {
  incomes: PublicIncome[];
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

function toPublicIncome(income: Income): PublicIncome {
  return {
    id: income.id,
    amount: formatMoney(income.amount),
    source: income.source,
    description: income.description,
    notes: income.notes,
    paymentMethod: income.paymentMethod,
    tags: income.tags,
    transactionDate: income.transactionDate,
    archivedAt: income.archivedAt,
    accountId: income.accountId,
    categoryId: income.categoryId,
    createdAt: income.createdAt,
    updatedAt: income.updatedAt,
  };
}

async function requireOwnedIncome(id: string, userId: string): Promise<Income> {
  const income = await incomeRepository.findByIdForUser(id, userId);
  if (!income) {
    throw new NotFoundError("Income not found");
  }
  return income;
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

async function requireActiveIncomeCategory(
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
  if (category.type !== CategoryType.INCOME) {
    throw new ValidationError("Income category must have type INCOME");
  }
  return category;
}

export const incomeService = {
  async list(userId: string, query: ListIncomesQuery): Promise<PaginatedIncomes> {
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

    const [incomes, total] = await Promise.all([
      incomeRepository.findManyForUser({ ...filters, skip, take: limit }),
      incomeRepository.countForUser(filters),
    ]);

    return {
      incomes: incomes.map(toPublicIncome),
      pagination: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  },

  async getById(userId: string, incomeId: string): Promise<PublicIncome> {
    const income = await requireOwnedIncome(incomeId, userId);
    return toPublicIncome(income);
  },

  async create(userId: string, input: CreateIncomeBody): Promise<PublicIncome> {
    const created = await prisma.$transaction(async (tx) => {
      await requireActiveOwnedAccount(input.accountId, userId, tx);
      await requireActiveIncomeCategory(input.categoryId, userId, tx);

      const income = await incomeRepository.create(
        {
          userId,
          accountId: input.accountId,
          categoryId: input.categoryId,
          amount: input.amount,
          source: input.source,
          description: input.description,
          notes: input.notes,
          paymentMethod: input.paymentMethod,
          tags: input.tags,
          transactionDate: input.transactionDate,
        },
        tx,
      );

      await accountRepository.adjustBalance(input.accountId, input.amount, tx);

      return income;
    });

    return toPublicIncome(created);
  },

  async update(
    userId: string,
    incomeId: string,
    input: UpdateIncomeBody,
  ): Promise<PublicIncome> {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.income.findFirst({
        where: { id: incomeId, userId },
      });
      if (!existing) {
        throw new NotFoundError("Income not found");
      }
      if (existing.archivedAt) {
        throw new ValidationError("Cannot update an archived income");
      }

      const nextAccountId = input.accountId ?? existing.accountId;
      const nextAmount = input.amount ?? formatMoney(existing.amount);

      if (input.accountId) {
        await requireActiveOwnedAccount(input.accountId, userId, tx);
      }
      if (input.categoryId) {
        await requireActiveIncomeCategory(input.categoryId, userId, tx);
      }

      const amountChanged =
        input.amount !== undefined &&
        !new Prisma.Decimal(input.amount).equals(existing.amount);
      const accountChanged =
        input.accountId !== undefined && input.accountId !== existing.accountId;

      if (amountChanged || accountChanged) {
        await requireActiveOwnedAccount(nextAccountId, userId, tx);
        await accountRepository.adjustBalance(
          existing.accountId,
          existing.amount.negated(),
          tx,
        );
        await accountRepository.adjustBalance(nextAccountId, nextAmount, tx);
      }

      return incomeRepository.update(
        existing.id,
        {
          accountId: input.accountId,
          categoryId: input.categoryId,
          amount: input.amount,
          source: input.source,
          description: input.description,
          notes: input.notes,
          paymentMethod: input.paymentMethod,
          tags: input.tags,
          transactionDate: input.transactionDate,
        },
        tx,
      );
    });

    return toPublicIncome(updated);
  },

  async archive(userId: string, incomeId: string): Promise<PublicIncome> {
    const archived = await prisma.$transaction(async (tx) => {
      const existing = await tx.income.findFirst({
        where: { id: incomeId, userId },
      });
      if (!existing) {
        throw new NotFoundError("Income not found");
      }
      if (existing.archivedAt) {
        return existing;
      }

      await accountRepository.adjustBalance(
        existing.accountId,
        existing.amount.negated(),
        tx,
      );
      return incomeRepository.archive(existing.id, tx);
    });

    return toPublicIncome(archived);
  },

  async unarchive(userId: string, incomeId: string): Promise<PublicIncome> {
    const restored = await prisma.$transaction(async (tx) => {
      const existing = await tx.income.findFirst({
        where: { id: incomeId, userId },
      });
      if (!existing) {
        throw new NotFoundError("Income not found");
      }
      if (!existing.archivedAt) {
        return existing;
      }

      await requireActiveOwnedAccount(existing.accountId, userId, tx);
      await requireActiveIncomeCategory(existing.categoryId, userId, tx);

      await accountRepository.adjustBalance(existing.accountId, existing.amount, tx);
      return incomeRepository.unarchive(existing.id, tx);
    });

    return toPublicIncome(restored);
  },
};
