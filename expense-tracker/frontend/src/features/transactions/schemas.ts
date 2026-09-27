import { z } from "zod";

const amountSchema = z.string().regex(/^\d+(\.\d{1,2})?$/, "Use amount like 12.50");

export const updateExpenseSchema = z.object({
  amount: amountSchema,
  accountId: z.string().min(1, "Account is required"),
  categoryId: z.string().min(1, "Category is required"),
  merchant: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  transactionDate: z.string().min(1, "Date is required"),
});

export const updateIncomeSchema = z.object({
  amount: amountSchema,
  accountId: z.string().min(1, "Account is required"),
  categoryId: z.string().min(1, "Category is required"),
  source: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  transactionDate: z.string().min(1, "Date is required"),
});

export const updateTransferSchema = z
  .object({
    amount: amountSchema,
    fromAccountId: z.string().min(1, "From account is required"),
    toAccountId: z.string().min(1, "To account is required"),
    description: z.string().optional(),
    notes: z.string().optional(),
    transactionDate: z.string().min(1, "Date is required"),
  })
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    message: "Accounts must be different",
    path: ["toAccountId"],
  });

export type UpdateExpenseFormValues = z.infer<typeof updateExpenseSchema>;
export type UpdateIncomeFormValues = z.infer<typeof updateIncomeSchema>;
export type UpdateTransferFormValues = z.infer<typeof updateTransferSchema>;

/** Backend optionalText rejects empty strings — coerce blanks to null. */
export function emptyToNull(value?: string): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export function toDateInputValue(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toISOString().slice(0, 10);
}
