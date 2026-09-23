import { Expense, PaymentMethod, Prisma } from "@prisma/client";
import { prisma } from "../config/database";

export type CreateExpenseInput = {
  userId: string;
  accountId: string;
  categoryId: string;
  amount: Prisma.Decimal | string | number;
  merchant?: string | null;
  description?: string | null;
  notes?: string | null;
  paymentMethod?: PaymentMethod | null;
  tags?: string[];
  transactionDate: Date;
};

export type UpdateExpenseInput = {
  accountId?: string;
  categoryId?: string;
  amount?: Prisma.Decimal | string | number;
  merchant?: string | null;
  description?: string | null;
  notes?: string | null;
  paymentMethod?: PaymentMethod | null;
  tags?: string[];
  transactionDate?: Date;
};

export const expenseRepository = {
  async findByIdForUser(id: string, userId: string): Promise<Expense | null> {
    return prisma.expense.findFirst({
      where: { id, userId },
    });
  },

  async findManyForUser(input: {
    userId: string;
    from?: Date;
    to?: Date;
    categoryId?: string;
    accountId?: string;
    includeArchived: boolean;
    skip: number;
    take: number;
  }): Promise<Expense[]> {
    return prisma.expense.findMany({
      where: buildWhere(input),
      orderBy: [{ transactionDate: "desc" }, { id: "desc" }],
      skip: input.skip,
      take: input.take,
    });
  },

  async countForUser(input: {
    userId: string;
    from?: Date;
    to?: Date;
    categoryId?: string;
    accountId?: string;
    includeArchived: boolean;
  }): Promise<number> {
    return prisma.expense.count({
      where: buildWhere(input),
    });
  },

  async create(
    input: CreateExpenseInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Expense> {
    const client = tx ?? prisma;
    return client.expense.create({
      data: {
        userId: input.userId,
        accountId: input.accountId,
        categoryId: input.categoryId,
        amount: input.amount,
        merchant: input.merchant ?? null,
        description: input.description ?? null,
        notes: input.notes ?? null,
        paymentMethod: input.paymentMethod ?? null,
        tags: input.tags ?? [],
        transactionDate: input.transactionDate,
      },
    });
  },

  async update(
    id: string,
    input: UpdateExpenseInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Expense> {
    const client = tx ?? prisma;
    return client.expense.update({
      where: { id },
      data: {
        ...(input.accountId !== undefined ? { accountId: input.accountId } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
        ...(input.amount !== undefined ? { amount: input.amount } : {}),
        ...(input.merchant !== undefined ? { merchant: input.merchant } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.paymentMethod !== undefined
          ? { paymentMethod: input.paymentMethod }
          : {}),
        ...(input.tags !== undefined ? { tags: input.tags } : {}),
        ...(input.transactionDate !== undefined
          ? { transactionDate: input.transactionDate }
          : {}),
      },
    });
  },

  async archive(id: string, tx?: Prisma.TransactionClient): Promise<Expense> {
    const client = tx ?? prisma;
    return client.expense.update({
      where: { id },
      data: { archivedAt: new Date() },
    });
  },

  async unarchive(id: string, tx?: Prisma.TransactionClient): Promise<Expense> {
    const client = tx ?? prisma;
    return client.expense.update({
      where: { id },
      data: { archivedAt: null },
    });
  },
};

function buildWhere(input: {
  userId: string;
  from?: Date;
  to?: Date;
  categoryId?: string;
  accountId?: string;
  includeArchived: boolean;
}): Prisma.ExpenseWhereInput {
  return {
    userId: input.userId,
    ...(input.categoryId ? { categoryId: input.categoryId } : {}),
    ...(input.accountId ? { accountId: input.accountId } : {}),
    ...(input.includeArchived ? {} : { archivedAt: null }),
    ...(input.from || input.to
      ? {
          transactionDate: {
            ...(input.from ? { gte: input.from } : {}),
            ...(input.to ? { lte: input.to } : {}),
          },
        }
      : {}),
  };
}
