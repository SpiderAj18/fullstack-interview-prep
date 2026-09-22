import { Category, CategoryType, Prisma } from "@prisma/client";
import { prisma } from "../config/database";

export type CreateCategoryInput = {
  userId: string;
  name: string;
  type: CategoryType;
  color?: string | null;
  icon?: string | null;
  sortOrder?: number;
  parentId?: string | null;
  isSystem?: boolean;
};

export type UpdateCategoryInput = {
  name?: string;
  color?: string | null;
  icon?: string | null;
  sortOrder?: number;
};

export const categoryRepository = {
  async countByUserId(userId: string): Promise<number> {
    return prisma.category.count({ where: { userId } });
  },

  async findByIdForUser(id: string, userId: string): Promise<Category | null> {
    return prisma.category.findFirst({
      where: { id, userId },
    });
  },

  async findManyForUser(input: {
    userId: string;
    type?: CategoryType;
    includeArchived: boolean;
  }): Promise<Category[]> {
    return prisma.category.findMany({
      where: {
        userId: input.userId,
        ...(input.type ? { type: input.type } : {}),
        ...(input.includeArchived ? {} : { archivedAt: null }),
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  },

  async findSiblingByName(input: {
    userId: string;
    type: CategoryType;
    name: string;
    parentId: string | null;
    excludeId?: string;
  }): Promise<Category | null> {
    return prisma.category.findFirst({
      where: {
        userId: input.userId,
        type: input.type,
        name: input.name,
        parentId: input.parentId,
        ...(input.excludeId ? { id: { not: input.excludeId } } : {}),
      },
    });
  },

  async countActiveChildren(parentId: string, userId: string): Promise<number> {
    return prisma.category.count({
      where: {
        parentId,
        userId,
        archivedAt: null,
      },
    });
  },

  async create(input: CreateCategoryInput): Promise<Category> {
    return prisma.category.create({
      data: {
        userId: input.userId,
        name: input.name,
        type: input.type,
        color: input.color ?? null,
        icon: input.icon ?? null,
        sortOrder: input.sortOrder ?? 0,
        parentId: input.parentId ?? null,
        isSystem: input.isSystem ?? false,
      },
    });
  },

  async createManyInTransaction(
    tx: Prisma.TransactionClient,
    rows: CreateCategoryInput[],
  ): Promise<void> {
    for (const row of rows) {
      await tx.category.create({
        data: {
          userId: row.userId,
          name: row.name,
          type: row.type,
          color: row.color ?? null,
          icon: row.icon ?? null,
          sortOrder: row.sortOrder ?? 0,
          parentId: row.parentId ?? null,
          isSystem: row.isSystem ?? false,
        },
      });
    }
  },

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.color !== undefined ? { color: input.color } : {}),
        ...(input.icon !== undefined ? { icon: input.icon } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      },
    });
  },

  async archive(id: string): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data: { archivedAt: new Date() },
    });
  },

  async unarchive(id: string): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data: { archivedAt: null },
    });
  },
};
