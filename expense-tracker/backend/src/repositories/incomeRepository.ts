import { Income, PaymentMethod, Prisma } from "@prisma/client";
import { prisma } from "../config/database";

export type CreateIncomeInput = {
  userId: string;
  accountId: string;
  categoryId: string;
  amount: Prisma.Decimal | string | number;
  source?: string | null;
  description?: string | null;
  notes?: string | null;
  paymentMethod?: PaymentMethod | null;
  tags?: string[];
  transactionDate: Date;
};

export type UpdateIncomeInput = {
  accountId?: string;
  categoryId?: string;
  amount?: Prisma.Decimal | string | number;
  source?: string | null;
  description?: string | null;
  notes?: string | null;
  paymentMethod?: PaymentMethod | null;
  tags?: string[];
  transactionDate?: Date;
};

export const incomeRepository = {
  async findByIdForUser(id: string, userId: string): Promise<Income | null> {
    return prisma.income.findFirst({
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
  }): Promise<Income[]> {
    return prisma.income.findMany({
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
    return prisma.income.count({
      where: buildWhere(input),
    });
  },

  async create(
    input: CreateIncomeInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Income> {
    const client = tx ?? prisma;
    return client.income.create({
      data: {
        userId: input.userId,
        accountId: input.accountId,
        categoryId: input.categoryId,
        amount: input.amount,
        source: input.source ?? null,
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
    input: UpdateIncomeInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Income> {
    const client = tx ?? prisma;
    return client.income.update({
      where: { id },
      data: {
        ...(input.accountId !== undefined ? { accountId: input.accountId } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
        ...(input.amount !== undefined ? { amount: input.amount } : {}),
        ...(input.source !== undefined ? { source: input.source } : {}),
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

  async archive(id: string, tx?: Prisma.TransactionClient): Promise<Income> {
    const client = tx ?? prisma;
    return client.income.update({
      where: { id },
      data: { archivedAt: new Date() },
    });
  },

  async unarchive(id: string, tx?: Prisma.TransactionClient): Promise<Income> {
    const client = tx ?? prisma;
    return client.income.update({
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
}): Prisma.IncomeWhereInput {
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
