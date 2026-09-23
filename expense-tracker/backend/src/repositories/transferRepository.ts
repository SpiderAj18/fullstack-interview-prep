import { Prisma, Transfer } from "@prisma/client";
import { prisma } from "../config/database";

export type CreateTransferInput = {
  userId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: Prisma.Decimal | string | number;
  description?: string | null;
  notes?: string | null;
  transactionDate: Date;
};

export type UpdateTransferInput = {
  fromAccountId?: string;
  toAccountId?: string;
  amount?: Prisma.Decimal | string | number;
  description?: string | null;
  notes?: string | null;
  transactionDate?: Date;
};

export const transferRepository = {
  async findByIdForUser(id: string, userId: string): Promise<Transfer | null> {
    return prisma.transfer.findFirst({
      where: { id, userId },
    });
  },

  async findManyForUser(input: {
    userId: string;
    from?: Date;
    to?: Date;
    accountId?: string;
    includeArchived: boolean;
    skip: number;
    take: number;
  }): Promise<Transfer[]> {
    return prisma.transfer.findMany({
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
    accountId?: string;
    includeArchived: boolean;
  }): Promise<number> {
    return prisma.transfer.count({
      where: buildWhere(input),
    });
  },

  async create(
    input: CreateTransferInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Transfer> {
    const client = tx ?? prisma;
    return client.transfer.create({
      data: {
        userId: input.userId,
        fromAccountId: input.fromAccountId,
        toAccountId: input.toAccountId,
        amount: input.amount,
        description: input.description ?? null,
        notes: input.notes ?? null,
        transactionDate: input.transactionDate,
      },
    });
  },

  async update(
    id: string,
    input: UpdateTransferInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Transfer> {
    const client = tx ?? prisma;
    return client.transfer.update({
      where: { id },
      data: {
        ...(input.fromAccountId !== undefined
          ? { fromAccountId: input.fromAccountId }
          : {}),
        ...(input.toAccountId !== undefined ? { toAccountId: input.toAccountId } : {}),
        ...(input.amount !== undefined ? { amount: input.amount } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.transactionDate !== undefined
          ? { transactionDate: input.transactionDate }
          : {}),
      },
    });
  },

  async archive(id: string, tx?: Prisma.TransactionClient): Promise<Transfer> {
    const client = tx ?? prisma;
    return client.transfer.update({
      where: { id },
      data: { archivedAt: new Date() },
    });
  },

  async unarchive(id: string, tx?: Prisma.TransactionClient): Promise<Transfer> {
    const client = tx ?? prisma;
    return client.transfer.update({
      where: { id },
      data: { archivedAt: null },
    });
  },
};

function buildWhere(input: {
  userId: string;
  from?: Date;
  to?: Date;
  accountId?: string;
  includeArchived: boolean;
}): Prisma.TransferWhereInput {
  return {
    userId: input.userId,
    ...(input.includeArchived ? {} : { archivedAt: null }),
    ...(input.accountId
      ? {
          OR: [
            { fromAccountId: input.accountId },
            { toAccountId: input.accountId },
          ],
        }
      : {}),
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
