import { z } from "zod";
import { AccountType } from "@prisma/client";

const hexColorSchema = z
  .string()
  .regex(/^#([0-9A-Fa-f]{6})$/, "Color must be a hex value like #RRGGBB")
  .optional()
  .nullable();

const moneySchema = z
  .union([z.string(), z.number()])
  .transform((value, ctx) => {
    const normalized = typeof value === "number" ? value.toFixed(2) : value.trim();
    if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) {
      ctx.addIssue({
        code: "custom",
        message: "Must be a decimal with up to 2 places",
      });
      return z.NEVER;
    }
    return normalized;
  });

const currencySchema = z
  .string()
  .trim()
  .length(3)
  .regex(/^[A-Z]{3}$/, "Currency must be a 3-letter ISO 4217 code")
  .default("INR");

export const accountTypeSchema = z.nativeEnum(AccountType);

export const listAccountsQuerySchema = z
  .object({
    type: accountTypeSchema.optional(),
    includeArchived: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
  })
  .strict();

export type ListAccountsQuery = z.infer<typeof listAccountsQuerySchema>;

export const createAccountBodySchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    type: accountTypeSchema,
    openingBalance: moneySchema.optional().default("0.00"),
    currency: currencySchema,
    color: hexColorSchema,
    icon: z.string().trim().min(1).max(50).optional().nullable(),
    sortOrder: z.number().int().min(0).max(10_000).optional(),
  })
  .strict();

export type CreateAccountBody = z.infer<typeof createAccountBodySchema>;

export const updateAccountBodySchema = z
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

export type UpdateAccountBody = z.infer<typeof updateAccountBodySchema>;

export const accountIdParamSchema = z
  .object({
    id: z.string().cuid(),
  })
  .strict();
