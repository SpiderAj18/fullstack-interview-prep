"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PiggyBank } from "lucide-react";
import { z } from "zod";
import { AmountDisplay, PercentageDisplay } from "@/components/feedback/CurrencyDisplay";
import { EmptyState } from "@/components/feedback/EmptyState";
import { SkeletonRows } from "@/components/feedback/Skeleton";
import { BudgetStatusBadge } from "@/components/feedback/StatusBadges";
import { Field } from "@/components/forms/Field";
import { FadeIn } from "@/components/motion/FadeIn";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useAcknowledgeAlert,
  useBudgetAlerts,
  useBudgets,
  useCreateBudget,
} from "@/features/budgets/hooks";

const schema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
  totalLimit: z.string().regex(/^\d+(\.\d{1,2})?$/, "Use amount like 1000.00"),
  warningThreshold: z.coerce.number().min(1).max(100).optional(),
  criticalThreshold: z.coerce.number().min(1).max(100).optional(),
});

type FormValues = z.infer<typeof schema>;

function BudgetAlerts({ budgetId }: { budgetId: string }) {
  const { data: alerts = [] } = useBudgetAlerts(budgetId);
  const acknowledge = useAcknowledgeAlert(budgetId);
  const openAlerts = alerts.filter((a) => !a.acknowledgedAt);

  if (openAlerts.length === 0) return null;

  return (
    <div className="mt-3 space-y-2 border-t border-border/70 pt-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Alerts
      </p>
      {openAlerts.map((alert) => (
        <div
          key={alert.id}
          className="flex items-start justify-between gap-3 rounded-xl bg-muted/60 px-3 py-2.5"
        >
          <div className="min-w-0">
            <div className="text-sm font-semibold">{alert.status}</div>
            <p className="text-xs text-muted-foreground">{alert.message}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={acknowledge.isPending}
            onClick={() => acknowledge.mutate(alert.id)}
          >
            Ack
          </Button>
        </div>
      ))}
    </div>
  );
}

export default function BudgetsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth() + 1);
  const { data: budgets = [], isLoading } = useBudgets(year, month);
  const createBudget = useCreateBudget();
  const [showForm, setShowForm] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      year,
      month,
      totalLimit: "1000.00",
      warningThreshold: 80,
      criticalThreshold: 95,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await createBudget.mutateAsync(values);
    setYear(values.year);
    setMonth(values.month);
    setShowForm(false);
  });

  return (
    <PageContainer>
      <PageHeader
        title="Budgets"
        description="Monthly limits with live utilization and alerts from the API."
        actions={
          <Button className="w-full sm:w-auto" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "Create budget"}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:flex sm:max-w-xs">
        <Field id="filter-year" label="Year" className="flex-1">
          <Input
            id="filter-year"
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </Field>
        <Field id="filter-month" label="Month" className="flex-1">
          <Input
            id="filter-month"
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          />
        </Field>
      </div>

      {showForm && (
        <FadeIn variant="scale">
          <Card>
            <CardHeader>
              <CardTitle>New monthly budget</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field id="year" label="Year">
                  <Input type="number" {...form.register("year")} />
                </Field>
                <Field id="month" label="Month">
                  <Input type="number" min={1} max={12} {...form.register("month")} />
                </Field>
                <Field id="totalLimit" label="Total limit">
                  <Input inputMode="decimal" {...form.register("totalLimit")} />
                </Field>
                <Field id="warningThreshold" label="Warning %">
                  <Input type="number" {...form.register("warningThreshold")} />
                </Field>
                <Field id="criticalThreshold" label="Critical %">
                  <Input type="number" {...form.register("criticalThreshold")} />
                </Field>
                <div className="sm:col-span-2 lg:col-span-3">
                  <Button type="submit" disabled={createBudget.isPending} className="w-full sm:w-auto">
                    {createBudget.isPending ? "Creating…" : "Create budget"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {isLoading && <SkeletonRows count={3} />}
      {!isLoading && budgets.length === 0 && (
        <EmptyState
          icon={PiggyBank}
          title="No budgets for this period"
          description="Create a monthly budget to track spending against your limit."
          actionLabel="Create budget"
          onAction={() => setShowForm(true)}
        />
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {budgets.map((budget, index) => (
          <Card
            key={budget.id}
            className="animate-fade-up transition-transform duration-200 hover:-translate-y-0.5"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
              <div>
                <CardTitle>
                  {budget.year}-{String(budget.month).padStart(2, "0")}
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">Limit {budget.totalLimit}</p>
              </div>
              <BudgetStatusBadge status={budget.utilization.status} />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Spent</p>
                  <AmountDisplay amount={budget.utilization.spent} className="text-xl font-bold" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Used</p>
                  <PercentageDisplay
                    value={budget.utilization.percentageUsed}
                    className="text-lg font-semibold"
                  />
                </div>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.min(100, Number(budget.utilization.percentageUsed) || 0)}%`,
                  }}
                />
              </div>
              {budget.categories.length > 0 && (
                <div className="space-y-2">
                  {budget.categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between text-sm text-muted-foreground"
                    >
                      <span className="truncate">{cat.categoryId.slice(0, 8)}…</span>
                      <span className="tabular-nums">
                        {cat.utilization.spent} / {cat.limitAmount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <BudgetAlerts budgetId={budget.id} />
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
