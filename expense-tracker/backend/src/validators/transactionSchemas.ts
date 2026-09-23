import { z } from "zod";

export const transactionTypeSchema = z.enum(["EXPENSE", "INCOME", "TRANSFER"]);

export type TransactionType = z.infer<typeof transactionTypeSchema>;

export const listTransactionsQuerySchema = z
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
    type: transactionTypeSchema.optional(),
    accountId: z.string().cuid().optional(),
    categoryId: z.string().cuid().optional(),
    merchant: z.string().trim().min(1).max(200).optional(),
    minAmount: z
      .union([z.string(), z.number()])
      .optional()
      .transform((value, ctx) => {
        if (value === undefined) return undefined;
        const normalized = typeof value === "number" ? value.toFixed(2) : value.trim();
        if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
          ctx.addIssue({ code: "custom", message: "Invalid minAmount" });
          return z.NEVER;
        }
        return normalized;
      }),
    maxAmount: z
      .union([z.string(), z.number()])
      .optional()
      .transform((value, ctx) => {
        if (value === undefined) return undefined;
        const normalized = typeof value === "number" ? value.toFixed(2) : value.trim();
        if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
          ctx.addIssue({ code: "custom", message: "Invalid maxAmount" });
          return z.NEVER;
        }
        return normalized;
      }),
    includeArchived: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  })
  .strict()
  .refine(
    (data) => {
      if (data.minAmount === undefined || data.maxAmount === undefined) return true;
      return Number(data.minAmount) <= Number(data.maxAmount);
    },
    { message: "minAmount must be <= maxAmount", path: ["maxAmount"] },
  );

export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
