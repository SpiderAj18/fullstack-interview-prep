import { describe, expect, it } from "vitest";
import { formatMoney, formatPercent } from "@/lib/formatting/money";

describe("money formatters", () => {
  it("formats currency amounts", () => {
    expect(formatMoney("1234.5")).toContain("1,234.50");
  });

  it("formats percentages", () => {
    expect(formatPercent("80")).toBe("80.00%");
  });
});
