import { z } from "zod";
import { CategoryType } from "@prisma/client";

const hexColorSchema = z
  .string()
  .regex(/^#([0-9A-Fa-f]{6})$/, "Color must be a hex value like #RRGGBB")
  .optional()
  .nullable();

export const categoryTypeSchema = z.nativeEnum(CategoryType);

export const listCategoriesQuerySchema = z
  .object({
    type: categoryTypeSchema.optional(),
    includeArchived: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
  })
  .strict();

export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;

export const createCategoryBodySchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    type: categoryTypeSchema,
    color: hexColorSchema,
    icon: z.string().trim().min(1).max(50).optional().nullable(),
    sortOrder: z.number().int().min(0).max(10_000).optional(),
    parentId: z.string().cuid().optional().nullable(),
  })
  .strict();

export type CreateCategoryBody = z.infer<typeof createCategoryBodySchema>;

export const updateCategoryBodySchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    color: hexColorSchema,
    icon: z.string().trim().min(1).max(50).optional().nullable(),
    sortOrder: z.number().int().min(0).max(10_000).optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.name !== undefined ||
      data.color !== undefined ||
      data.icon !== undefined ||
      data.sortOrder !== undefined,
    { message: "At least one field is required" },
  );

export type UpdateCategoryBody = z.infer<typeof updateCategoryBodySchema>;

export const categoryIdParamSchema = z
  .object({
    id: z.string().cuid(),
  })
  .strict();
