import { Account, AccountType, Prisma } from "@prisma/client";
import { prisma } from "../config/database";

export type CreateAccountInput = {
  userId: string;
  name: string;
  type: AccountType;
  currency?: string;
  color?: string | null;
  icon?: string | null;
  sortOrder?: number;
  openingBalance: Prisma.Decimal | string | number;
  currentBalance: Prisma.Decimal | string | number;
  isSystem?: boolean;
};

export type UpdateAccountInput = {
  name?: string;
  color?: string | null;
  icon?: string | null;
  sortOrder?: number;
};

export const accountRepository = {
  async countByUserId(userId: string): Promise<number> {
    return prisma.account.count({ where: { userId } });
  },

  async countActiveByUserId(userId: string): Promise<number> {
    return prisma.account.count({
      where: { userId, archivedAt: null },
    });
  },

  async findByIdForUser(id: string, userId: string): Promise<Account | null> {
    return prisma.account.findFirst({
      where: { id, userId },
    });
  },

  async findByNameForUser(userId: string, name: string): Promise<Account | null> {
    return prisma.account.findFirst({
      where: { userId, name },
    });
  },

  async findManyForUser(input: {
    userId: string;
    type?: AccountType;
    includeArchived: boolean;
  }): Promise<Account[]> {
    return prisma.account.findMany({
      where: {
        userId: input.userId,
        ...(input.type ? { type: input.type } : {}),
        ...(input.includeArchived ? {} : { archivedAt: null }),
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  },

  async create(
    input: CreateAccountInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Account> {
    const client = tx ?? prisma;
    return client.account.create({
      data: {
        userId: input.userId,
        name: input.name,
        type: input.type,
        currency: input.currency ?? "INR",
        color: input.color ?? null,
        icon: input.icon ?? null,
        sortOrder: input.sortOrder ?? 0,
        openingBalance: input.openingBalance,
        currentBalance: input.currentBalance,
        isSystem: input.isSystem ?? false,
      },
    });
  },

  async update(id: string, input: UpdateAccountInput): Promise<Account> {
    return prisma.account.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.color !== undefined ? { color: input.color } : {}),
        ...(input.icon !== undefined ? { icon: input.icon } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      },
    });
  },

  async archive(id: string): Promise<Account> {
    return prisma.account.update({
      where: { id },
      data: { archivedAt: new Date() },
    });
  },

  async unarchive(id: string): Promise<Account> {
    return prisma.account.update({
      where: { id },
      data: { archivedAt: null },
    });
  },

  async adjustBalance(
    id: string,
    delta: Prisma.Decimal | string | number,
    tx?: Prisma.TransactionClient,
  ): Promise<Account> {
    const client = tx ?? prisma;
    return client.account.update({
      where: { id },
      data: {
        currentBalance: {
          increment: delta,
        },
      },
    });
  },
};
