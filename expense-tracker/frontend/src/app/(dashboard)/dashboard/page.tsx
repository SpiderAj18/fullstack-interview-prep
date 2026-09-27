"use client";

import Link from "next/link";
import { AmountDisplay } from "@/components/feedback/CurrencyDisplay";
import { BudgetStatusBadge, TransactionTypeBadge } from "@/components/feedback/StatusBadges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccounts } from "@/features/accounts/hooks";
import { useBudgets } from "@/features/budgets/hooks";
import { useTransactions } from "@/features/transactions/hooks";
import { formatDate } from "@/lib/formatting/money";

export default function DashboardPage() {
  const now = new Date();
  const { data: accounts = [], isLoading: accountsLoading } = useAccounts();
  const { data: txData, isLoading: txLoading } = useTransactions({ page: 1, limit: 5 });
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
  );

  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.currentBalance), 0);
  const recent = txData?.transactions ?? [];
  const budget = budgets[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Balances, recent activity, and this month&apos;s budget snapshot.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/transactions">Add transaction</Link>
          </Button>
          <Button asChild>
            <Link href="/budgets">Manage budgets</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accountsLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <AmountDisplay amount={totalBalance.toFixed(2)} className="text-2xl" />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">
            {accounts.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {budgetsLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : budget ? (
              <div className="space-y-2">
                <BudgetStatusBadge status={budget.utilization.status} />
                <div className="text-sm text-muted-foreground">
                  {budget.utilization.percentageUsed}% of {budget.totalLimit}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No budget for this month</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {txLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!txLoading && recent.length === 0 && (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          )}
          {recent.map((txn) => (
            <div
              key={`${txn.type}-${txn.id}`}
              className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <TransactionTypeBadge type={txn.type} />
                  <span className="truncate text-sm font-medium">
                    {txn.merchant || txn.source || txn.description || "Transaction"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">{formatDate(txn.transactionDate)}</div>
              </div>
              <AmountDisplay
                amount={txn.amount}
                tone={txn.type === "EXPENSE" ? "expense" : txn.type === "INCOME" ? "income" : "neutral"}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
