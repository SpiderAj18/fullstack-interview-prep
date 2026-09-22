import { Prisma } from "@prisma/client";
import { DEFAULT_CATEGORIES } from "../data/defaultCategories";
import { categoryRepository } from "../repositories/categoryRepository";
import { prisma } from "../config/database";

export const categorySeedService = {
  async seedDefaultsForUser(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? prisma;
    const rows: Parameters<typeof categoryRepository.createManyInTransaction>[1] = [];

    for (const parent of DEFAULT_CATEGORIES) {
      const createdParent = await client.category.create({
        data: {
          userId,
          name: parent.name,
          type: parent.type,
          color: parent.color ?? null,
          icon: parent.icon ?? null,
          sortOrder: parent.sortOrder,
          isSystem: true,
          parentId: null,
        },
      });

      for (const child of parent.children ?? []) {
        rows.push({
          userId,
          name: child.name,
          type: parent.type,
          color: child.color ?? null,
          icon: child.icon ?? null,
          sortOrder: child.sortOrder,
          parentId: createdParent.id,
          isSystem: true,
        });
      }
    }

    if (rows.length > 0) {
      await categoryRepository.createManyInTransaction(client, rows);
    }
  },

  async seedDefaultsIfEmpty(userId: string): Promise<boolean> {
    const count = await categoryRepository.countByUserId(userId);
    if (count > 0) {
      return false;
    }

    await categorySeedService.seedDefaultsForUser(userId);
    return true;
  },
};
