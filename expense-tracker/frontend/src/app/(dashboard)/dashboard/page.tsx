"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PiggyBank, Plus, Wallet } from "lucide-react";
import { AmountDisplay } from "@/components/feedback/CurrencyDisplay";
import { EmptyState } from "@/components/feedback/EmptyState";
import { SkeletonRows } from "@/components/feedback/Skeleton";
import { StatCard } from "@/components/feedback/StatCard";
import { BudgetStatusBadge, TransactionTypeBadge } from "@/components/feedback/StatusBadges";
import { FadeIn } from "@/components/motion/FadeIn";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccounts } from "@/features/accounts/hooks";
import { useBudgets } from "@/features/budgets/hooks";
import { useTransactions } from "@/features/transactions/hooks";
import { formatDate } from "@/lib/formatting/money";

export default function DashboardPage() {
  const router = useRouter();
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
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Your balances, recent activity, and this month’s budget at a glance."
        actions={
          <>
            <Button asChild variant="outline" className="flex-1 sm:flex-none">
              <Link href="/budgets">Budgets</Link>
            </Button>
            <Button asChild className="flex-1 sm:flex-none">
              <Link href="/transactions">
                <Plus className="h-4 w-4" />
                Add
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total balance"
          icon={Wallet}
          loading={accountsLoading}
          stagger={1}
          value={<AmountDisplay amount={totalBalance.toFixed(2)} className="text-2xl font-bold" />}
        />
        <StatCard
          label="Active accounts"
          icon={Wallet}
          loading={accountsLoading}
          stagger={2}
          value={accounts.length}
        />
        <StatCard
          label="Budget status"
          icon={PiggyBank}
          loading={budgetsLoading}
          stagger={3}
          className="sm:col-span-2 lg:col-span-1"
          value={
            budget ? (
              <div className="flex flex-wrap items-center gap-2">
                <BudgetStatusBadge status={budget.utilization.status} />
              </div>
            ) : (
              <span className="text-base font-semibold text-muted-foreground">No budget yet</span>
            )
          }
          hint={
            budget
              ? `${budget.utilization.percentageUsed}% of ${budget.totalLimit}`
              : "Create a monthly budget to stay on track"
          }
        />
      </div>

      <FadeIn stagger={4}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle>Recent activity</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/transactions">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {txLoading && <SkeletonRows count={4} />}
            {!txLoading && recent.length === 0 && (
              <EmptyState
                icon={Plus}
                title="No transactions yet"
                description="Record your first expense or income to see activity here."
                actionLabel="Add transaction"
                onAction={() => router.push("/transactions")}
              />
            )}
            {recent.map((txn, index) => (
              <div
                key={`${txn.type}-${txn.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 px-3.5 py-3 transition-colors hover:bg-muted/60 animate-fade-up"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <TransactionTypeBadge type={txn.type} />
                    <span className="truncate text-sm font-semibold">
                      {txn.merchant || txn.source || txn.description || "Transaction"}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatDate(txn.transactionDate)}
                  </div>
                </div>
                <AmountDisplay
                  amount={txn.amount}
                  tone={
                    txn.type === "EXPENSE" ? "expense" : txn.type === "INCOME" ? "income" : "neutral"
                  }
                  className="shrink-0 text-base font-semibold"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </FadeIn>
    </PageContainer>
  );
}
