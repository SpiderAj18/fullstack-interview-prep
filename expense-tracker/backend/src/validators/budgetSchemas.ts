import { z } from "zod";

const positiveMoneySchema = z
  .union([z.string(), z.number()])
  .transform((value, ctx) => {
    const normalized = typeof value === "number" ? value.toFixed(2) : value.trim();
    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
      ctx.addIssue({
        code: "custom",
        message: "Must be a positive decimal with up to 2 places",
      });
      return z.NEVER;
    }
    if (Number(normalized) <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Amount must be greater than zero",
      });
      return z.NEVER;
    }
    return normalized;
  });

const thresholdSchema = z.number().int().min(1).max(100);

const budgetCategoryInputSchema = z
  .object({
    categoryId: z.string().cuid(),
    limitAmount: positiveMoneySchema,
  })
  .strict();

export const listBudgetsQuerySchema = z
  .object({
    year: z.coerce.number().int().min(2000).max(2100).optional(),
    month: z.coerce.number().int().min(1).max(12).optional(),
    includeArchived: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
  })
  .strict();

export type ListBudgetsQuery = z.infer<typeof listBudgetsQuerySchema>;

export const createBudgetBodySchema = z
  .object({
    year: z.number().int().min(2000).max(2100),
    month: z.number().int().min(1).max(12),
    totalLimit: positiveMoneySchema,
    currency: z
      .string()
      .trim()
      .length(3)
      .regex(/^[A-Z]{3}$/)
      .optional()
      .default("INR"),
    warningThreshold: thresholdSchema.optional().default(80),
    criticalThreshold: thresholdSchema.optional().default(90),
    categories: z.array(budgetCategoryInputSchema).max(100).optional().default([]),
  })
  .strict()
  .refine((data) => data.warningThreshold < data.criticalThreshold, {
    message: "warningThreshold must be less than criticalThreshold",
    path: ["warningThreshold"],
  })
  .refine((data) => data.criticalThreshold < 100, {
    message: "criticalThreshold must be less than 100",
    path: ["criticalThreshold"],
  });

export type CreateBudgetBody = z.infer<typeof createBudgetBodySchema>;

export const updateBudgetBodySchema = z
  .object({
    totalLimit: positiveMoneySchema.optional(),
    currency: z
      .string()
      .trim()
      .length(3)
      .regex(/^[A-Z]{3}$/)
      .optional(),
    warningThreshold: thresholdSchema.optional(),
    criticalThreshold: thresholdSchema.optional(),
    categories: z.array(budgetCategoryInputSchema).max(100).optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.totalLimit !== undefined ||
      data.currency !== undefined ||
      data.warningThreshold !== undefined ||
      data.criticalThreshold !== undefined ||
      data.categories !== undefined,
    { message: "At least one field is required" },
  );

export type UpdateBudgetBody = z.infer<typeof updateBudgetBodySchema>;

export const budgetIdParamSchema = z
  .object({
    id: z.string().cuid(),
  })
  .strict();

export const budgetAlertIdParamSchema = z
  .object({
    id: z.string().cuid(),
    alertId: z.string().cuid(),
  })
  .strict();

export const listBudgetAlertsQuerySchema = z
  .object({
    includeAcknowledged: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
  })
  .strict();

export type ListBudgetAlertsQuery = z.infer<typeof listBudgetAlertsQuerySchema>;
