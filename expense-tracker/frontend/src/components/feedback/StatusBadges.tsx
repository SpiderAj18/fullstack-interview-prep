import { Badge } from "@/components/ui/badge";

export function TransactionTypeBadge({
  type,
}: {
  type: "EXPENSE" | "INCOME" | "TRANSFER";
}) {
  const variant =
    type === "EXPENSE" ? "exceeded" : type === "INCOME" ? "safe" : "secondary";
  return <Badge variant={variant}>{type}</Badge>;
}

export function BudgetStatusBadge({
  status,
}: {
  status: "SAFE" | "WARNING" | "CRITICAL" | "EXCEEDED";
}) {
  const variant =
    status === "SAFE"
      ? "safe"
      : status === "WARNING"
        ? "warning"
        : status === "CRITICAL"
          ? "critical"
          : "exceeded";
  return <Badge variant={variant}>{status}</Badge>;
}
