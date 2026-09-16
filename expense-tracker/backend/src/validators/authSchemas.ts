import { z } from "zod";

export const registerBodySchema = z
  .object({
    email: z.string().trim().email().max(255),
    password: z.string().min(8).max(72),
    name: z
      .string()
      .trim()
      .max(100)
      .optional()
      .transform((value) => (value === undefined || value.length === 0 ? undefined : value)),
  })
  .strict();

export type RegisterBody = z.infer<typeof registerBodySchema>;

export const loginBodySchema = z
  .object({
    email: z.string().trim().email().max(255),
    password: z.string().min(8).max(72),
  })
  .strict();

export type LoginBody = z.infer<typeof loginBodySchema>;
