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

const transactionDateSchema = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid transactionDate",
  })
  .transform((value) => new Date(value));

const optionalText = (max: number) =>
  z.string().trim().min(1).max(max).optional().nullable();

export const listTransfersQuerySchema = z
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
    accountId: z.string().cuid().optional(),
    includeArchived: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  })
  .strict();

export type ListTransfersQuery = z.infer<typeof listTransfersQuerySchema>;

export const createTransferBodySchema = z
  .object({
    amount: positiveMoneySchema,
    fromAccountId: z.string().cuid(),
    toAccountId: z.string().cuid(),
    description: optionalText(500),
    notes: optionalText(2000),
    transactionDate: transactionDateSchema,
  })
  .strict()
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    message: "fromAccountId and toAccountId must be different",
    path: ["toAccountId"],
  });

export type CreateTransferBody = z.infer<typeof createTransferBodySchema>;

export const updateTransferBodySchema = z
  .object({
    amount: positiveMoneySchema.optional(),
    fromAccountId: z.string().cuid().optional(),
    toAccountId: z.string().cuid().optional(),
    description: optionalText(500),
    notes: optionalText(2000),
    transactionDate: transactionDateSchema.optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.amount !== undefined ||
      data.fromAccountId !== undefined ||
      data.toAccountId !== undefined ||
      data.description !== undefined ||
      data.notes !== undefined ||
      data.transactionDate !== undefined,
    { message: "At least one field is required" },
  );

export type UpdateTransferBody = z.infer<typeof updateTransferBodySchema>;

export const transferIdParamSchema = z
  .object({
    id: z.string().cuid(),
  })
  .strict();

export { idempotencyKeySchema } from "./expenseSchemas";
