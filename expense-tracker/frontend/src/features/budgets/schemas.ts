import { z } from "zod";
import type { CategoryNode } from "@/types/api";

const moneySchema = z.string().regex(/^\d+(\.\d{1,2})?$/, "Use amount like 100.00");

export const budgetCategoryRowSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  limitAmount: moneySchema,
});

export const createBudgetSchema = z
  .object({
    year: z.coerce.number().int().min(2000).max(2100),
    month: z.coerce.number().int().min(1).max(12),
    totalLimit: moneySchema,
    warningThreshold: z.coerce.number().int().min(1).max(99),
    criticalThreshold: z.coerce.number().int().min(2).max(99),
    categories: z.array(budgetCategoryRowSchema),
  })
  .refine((data) => data.warningThreshold < data.criticalThreshold, {
    message: "Warning must be less than critical",
    path: ["warningThreshold"],
  })
  .refine(
    (data) => {
      const sum = data.categories.reduce((acc, row) => acc + Number(row.limitAmount || 0), 0);
      return sum <= Number(data.totalLimit);
    },
    {
      message: "Category limits cannot exceed the total budget",
      path: ["categories"],
    },
  )
  .refine(
    (data) => {
      const ids = data.categories.map((row) => row.categoryId).filter(Boolean);
      return new Set(ids).size === ids.length;
    },
    {
      message: "Duplicate categories are not allowed",
      path: ["categories"],
    },
  );

export const updateBudgetSchema = z
  .object({
    totalLimit: moneySchema,
    warningThreshold: z.coerce.number().int().min(1).max(99),
    criticalThreshold: z.coerce.number().int().min(2).max(99),
    categories: z.array(budgetCategoryRowSchema),
  })
  .refine((data) => data.warningThreshold < data.criticalThreshold, {
    message: "Warning must be less than critical",
    path: ["warningThreshold"],
  })
  .refine(
    (data) => {
      const sum = data.categories.reduce((acc, row) => acc + Number(row.limitAmount || 0), 0);
      return sum <= Number(data.totalLimit);
    },
    {
      message: "Category limits cannot exceed the total budget",
      path: ["categories"],
    },
  )
  .refine(
    (data) => {
      const ids = data.categories.map((row) => row.categoryId).filter(Boolean);
      return new Set(ids).size === ids.length;
    },
    {
      message: "Duplicate categories are not allowed",
      path: ["categories"],
    },
  );

export type CreateBudgetFormValues = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetFormValues = z.infer<typeof updateBudgetSchema>;

export function flattenExpenseCategories(nodes: CategoryNode[]): CategoryNode[] {
  const result: CategoryNode[] = [];
  for (const node of nodes) {
    if (node.type === "EXPENSE" && !node.archivedAt) {
      result.push(node);
    }
    if (node.children?.length) {
      result.push(...flattenExpenseCategories(node.children));
    }
  }
  return result;
}

export function categoryNameMap(nodes: CategoryNode[]): Map<string, string> {
  const map = new Map<string, string>();
  const walk = (items: CategoryNode[]) => {
    for (const item of items) {
      map.set(item.id, item.name);
      if (item.children?.length) walk(item.children);
    }
  };
  walk(nodes);
  return map;
}
