import { z } from "zod";
import { PaymentMethod } from "@prisma/client";

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

const transactionDateSchema = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid transactionDate",
  })
  .transform((value) => new Date(value));

const optionalText = (max: number) =>
  z.string().trim().min(1).max(max).optional().nullable();

export const paymentMethodSchema = z.nativeEnum(PaymentMethod);

export const listExpensesQuerySchema = z
  .object({
    from: z
      .string()
      .trim()
      .optional()
      .refine((value) => value === undefined || !Number.isNaN(Date.parse(value)), {
        message: "Invalid from date",
      })
      .transform((value) => (value ? new Date(value) : undefined)),
    to: z
      .string()
      .trim()
      .optional()
      .refine((value) => value === undefined || !Number.isNaN(Date.parse(value)), {
        message: "Invalid to date",
      })
      .transform((value) => (value ? new Date(value) : undefined)),
    categoryId: z.string().cuid().optional(),
    accountId: z.string().cuid().optional(),
    includeArchived: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  })
  .strict();

export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;

export const createExpenseBodySchema = z
  .object({
    amount: positiveMoneySchema,
    accountId: z.string().cuid(),
    categoryId: z.string().cuid(),
    merchant: optionalText(200),
    description: optionalText(500),
    notes: optionalText(2000),
    paymentMethod: paymentMethodSchema.optional().nullable(),
    tags: z.array(z.string().trim().min(1).max(50)).max(20).optional().default([]),
    transactionDate: transactionDateSchema,
  })
  .strict();

export type CreateExpenseBody = z.infer<typeof createExpenseBodySchema>;

export const updateExpenseBodySchema = z
  .object({
    amount: positiveMoneySchema.optional(),
    accountId: z.string().cuid().optional(),
    categoryId: z.string().cuid().optional(),
    merchant: optionalText(200),
    description: optionalText(500),
    notes: optionalText(2000),
    paymentMethod: paymentMethodSchema.optional().nullable(),
    tags: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
    transactionDate: transactionDateSchema.optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.amount !== undefined ||
      data.accountId !== undefined ||
      data.categoryId !== undefined ||
      data.merchant !== undefined ||
      data.description !== undefined ||
      data.notes !== undefined ||
      data.paymentMethod !== undefined ||
      data.tags !== undefined ||
      data.transactionDate !== undefined,
    { message: "At least one field is required" },
  );

export type UpdateExpenseBody = z.infer<typeof updateExpenseBodySchema>;

export const expenseIdParamSchema = z
  .object({
    id: z.string().cuid(),
  })
  .strict();

export const idempotencyKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .optional();
