import { describe, expect, it } from "vitest";
import { createBudgetSchema } from "@/features/budgets/schemas";

describe("budget schemas", () => {
  it("accepts category limits under the total", () => {
    const parsed = createBudgetSchema.safeParse({
      year: 2026,
      month: 9,
      totalLimit: "1000.00",
      warningThreshold: 80,
      criticalThreshold: 95,
      categories: [
        { categoryId: "cat_a", limitAmount: "400.00" },
        { categoryId: "cat_b", limitAmount: "500.00" },
      ],
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects category limits above the total", () => {
    const parsed = createBudgetSchema.safeParse({
      year: 2026,
      month: 9,
      totalLimit: "100.00",
      warningThreshold: 80,
      criticalThreshold: 95,
      categories: [{ categoryId: "cat_a", limitAmount: "150.00" }],
    });
    expect(parsed.success).toBe(false);
  });
});
