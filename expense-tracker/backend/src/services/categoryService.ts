import { Category, CategoryType } from "@prisma/client";
import { categoryRepository } from "../repositories/categoryRepository";
import { ConflictError, NotFoundError, ValidationError } from "../utils/errors";
import type {
  CreateCategoryBody,
  ListCategoriesQuery,
  UpdateCategoryBody,
} from "../validators/categorySchemas";
import { categorySeedService } from "./categorySeedService";

export type CategoryNode = {
  id: string;
  name: string;
  type: CategoryType;
  color: string | null;
  icon: string | null;
  sortOrder: number;
  isSystem: boolean;
  archivedAt: Date | null;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  children: CategoryNode[];
};

function toCategoryNode(category: Category, children: CategoryNode[] = []): CategoryNode {
  return {
    id: category.id,
    name: category.name,
    type: category.type,
    color: category.color,
    icon: category.icon,
    sortOrder: category.sortOrder,
    isSystem: category.isSystem,
    archivedAt: category.archivedAt,
    parentId: category.parentId,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    children,
  };
}

function buildTree(categories: Category[]): CategoryNode[] {
  const byParent = new Map<string | null, Category[]>();

  for (const category of categories) {
    const key = category.parentId;
    const list = byParent.get(key) ?? [];
    list.push(category);
    byParent.set(key, list);
  }

  const roots = byParent.get(null) ?? [];

  return roots.map((root) => {
    const children = (byParent.get(root.id) ?? []).map((child) => toCategoryNode(child));
    return toCategoryNode(root, children);
  });
}

async function requireOwnedCategory(id: string, userId: string): Promise<Category> {
  const category = await categoryRepository.findByIdForUser(id, userId);
  if (!category) {
    throw new NotFoundError("Category not found");
  }
  return category;
}

async function assertUniqueSiblingName(input: {
  userId: string;
  type: CategoryType;
  name: string;
  parentId: string | null;
  excludeId?: string;
}): Promise<void> {
  const existing = await categoryRepository.findSiblingByName(input);
  if (existing) {
    throw new ConflictError("A category with this name already exists at this level");
  }
}

export const categoryService = {
  async list(userId: string, query: ListCategoriesQuery): Promise<CategoryNode[]> {
    await categorySeedService.seedDefaultsIfEmpty(userId);

    const categories = await categoryRepository.findManyForUser({
      userId,
      type: query.type,
      includeArchived: query.includeArchived ?? false,
    });

    return buildTree(categories);
  },

  async create(userId: string, input: CreateCategoryBody): Promise<CategoryNode> {
    const parentId = input.parentId ?? null;

    if (parentId) {
      const parent = await requireOwnedCategory(parentId, userId);
      if (parent.archivedAt) {
        throw new ValidationError("Cannot create a subcategory under an archived category");
      }
      if (parent.parentId) {
        throw new ValidationError("Categories support only one level of nesting");
      }
      if (parent.type !== input.type) {
        throw new ValidationError("Subcategory type must match parent type");
      }
    }

    await assertUniqueSiblingName({
      userId,
      type: input.type,
      name: input.name,
      parentId,
    });

    const created = await categoryRepository.create({
      userId,
      name: input.name,
      type: input.type,
      color: input.color,
      icon: input.icon,
      sortOrder: input.sortOrder,
      parentId,
      isSystem: false,
    });

    return toCategoryNode(created);
  },

  async update(
    userId: string,
    categoryId: string,
    input: UpdateCategoryBody,
  ): Promise<CategoryNode> {
    const category = await requireOwnedCategory(categoryId, userId);

    if (input.name && input.name !== category.name) {
      await assertUniqueSiblingName({
        userId,
        type: category.type,
        name: input.name,
        parentId: category.parentId,
        excludeId: category.id,
      });
    }

    const updated = await categoryRepository.update(category.id, {
      name: input.name,
      color: input.color,
      icon: input.icon,
      sortOrder: input.sortOrder,
    });

    return toCategoryNode(updated);
  },

  async archive(userId: string, categoryId: string): Promise<CategoryNode> {
    const category = await requireOwnedCategory(categoryId, userId);

    if (category.archivedAt) {
      return toCategoryNode(category);
    }

    if (!category.parentId) {
      const activeChildren = await categoryRepository.countActiveChildren(
        category.id,
        userId,
      );
      if (activeChildren > 0) {
        throw new ConflictError(
          "Archive or move active subcategories before archiving this category",
        );
      }
    }

    const archived = await categoryRepository.archive(category.id);
    return toCategoryNode(archived);
  },

  async unarchive(userId: string, categoryId: string): Promise<CategoryNode> {
    const category = await requireOwnedCategory(categoryId, userId);

    if (!category.archivedAt) {
      return toCategoryNode(category);
    }

    if (category.parentId) {
      const parent = await requireOwnedCategory(category.parentId, userId);
      if (parent.archivedAt) {
        throw new ValidationError("Unarchive the parent category first");
      }
    }

    const restored = await categoryRepository.unarchive(category.id);
    return toCategoryNode(restored);
  },
};
