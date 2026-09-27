import { describe, expect, it } from "vitest";
import {
  emptyToNull,
  toDateInputValue,
  updateExpenseSchema,
} from "@/features/transactions/schemas";
import {
  fromTransactionTypeParam,
  toTransactionTypeParam,
} from "@/features/transactions/api/transactions.api";

describe("transaction helpers", () => {
  it("maps transaction type params", () => {
    expect(toTransactionTypeParam("EXPENSE")).toBe("expense");
    expect(fromTransactionTypeParam("income")).toBe("INCOME");
    expect(fromTransactionTypeParam("nope")).toBeNull();
  });

  it("coerces empty optional text to null", () => {
    expect(emptyToNull("")).toBeNull();
    expect(emptyToNull("  ")).toBeNull();
    expect(emptyToNull("Coffee")).toBe("Coffee");
  });

  it("formats dates for input controls", () => {
    expect(toDateInputValue("2026-09-27T12:00:00.000Z")).toBe("2026-09-27");
  });

  it("validates expense updates", () => {
    const parsed = updateExpenseSchema.safeParse({
      amount: "12.50",
      accountId: "acc_1",
      categoryId: "cat_1",
      transactionDate: "2026-09-27",
    });
    expect(parsed.success).toBe(true);
  });
});
