"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AmountDisplay, PercentageDisplay } from "@/components/feedback/CurrencyDisplay";
import { BudgetStatusBadge } from "@/components/feedback/StatusBadges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="mt-3 space-y-2 border-t border-border pt-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Alerts</p>
      {openAlerts.map((alert) => (
        <div
          key={alert.id}
          className="flex items-start justify-between gap-3 rounded-md bg-muted/60 px-3 py-2"
        >
          <div>
            <div className="text-sm font-medium">{alert.status}</div>
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
          <p className="text-sm text-muted-foreground">
            Monthly limits with utilization and alerts from the API.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "Create budget"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="space-y-1">
          <Label htmlFor="filter-year">Year</Label>
          <Input
            id="filter-year"
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-28"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="filter-month">Month</Label>
          <Input
            id="filter-month"
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-24"
          />
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New monthly budget</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Year</Label>
                <Input type="number" {...form.register("year")} />
              </div>
              <div className="space-y-2">
                <Label>Month</Label>
                <Input type="number" min={1} max={12} {...form.register("month")} />
              </div>
              <div className="space-y-2">
                <Label>Total limit</Label>
                <Input {...form.register("totalLimit")} />
              </div>
              <div className="space-y-2">
                <Label>Warning %</Label>
                <Input type="number" {...form.register("warningThreshold")} />
              </div>
              <div className="space-y-2">
                <Label>Critical %</Label>
                <Input type="number" {...form.register("criticalThreshold")} />
              </div>
              <div className="md:col-span-3">
                <Button type="submit" disabled={createBudget.isPending}>
                  {createBudget.isPending ? "Creating…" : "Create budget"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading budgets…</p>}
        {!isLoading && budgets.length === 0 && (
          <p className="text-sm text-muted-foreground">No budgets for this period.</p>
        )}
        {budgets.map((budget) => (
          <Card key={budget.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
              <div>
                <CardTitle className="text-base">
                  {budget.year}-{String(budget.month).padStart(2, "0")}
                </CardTitle>
                <p className="text-xs text-muted-foreground">Limit {budget.totalLimit}</p>
              </div>
              <BudgetStatusBadge status={budget.utilization.status} />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Spent</p>
                  <AmountDisplay amount={budget.utilization.spent} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Used</p>
                  <PercentageDisplay value={budget.utilization.percentageUsed} />
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
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
    </div>
  );
}
