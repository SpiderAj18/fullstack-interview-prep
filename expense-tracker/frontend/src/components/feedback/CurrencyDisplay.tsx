import { formatMoney, formatPercent } from "@/lib/formatting/money";
import { cn } from "@/lib/utils";

export function CurrencyDisplay({
  amount,
  currency = "INR",
  className,
}: {
  amount: string | number;
  currency?: string;
  className?: string;
}) {
  return <span className={cn("font-medium tabular-nums", className)}>{formatMoney(amount, currency)}</span>;
}

export function AmountDisplay({
  amount,
  currency = "INR",
  tone = "neutral",
  className,
}: {
  amount: string | number;
  currency?: string;
  tone?: "neutral" | "expense" | "income";
  className?: string;
}) {
  return (
    <CurrencyDisplay
      amount={amount}
      currency={currency}
      className={cn(
        tone === "expense" && "text-destructive",
        tone === "income" && "text-safe",
        className,
      )}
    />
  );
}

export function PercentageDisplay({
  value,
  className,
}: {
  value: string | number;
  className?: string;
}) {
  return <span className={cn("tabular-nums", className)}>{formatPercent(value)}</span>;
}
