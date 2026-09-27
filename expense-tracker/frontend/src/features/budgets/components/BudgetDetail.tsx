"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Archive, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { AmountDisplay, PercentageDisplay } from "@/components/feedback/CurrencyDisplay";
import { SkeletonRows } from "@/components/feedback/Skeleton";
import { BudgetStatusBadge } from "@/components/feedback/StatusBadges";
import { Field } from "@/components/forms/Field";
import { FadeIn } from "@/components/motion/FadeIn";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCategories } from "@/features/categories/hooks";
import {
  useArchiveBudget,
  useBudget,
  useBudgetAlerts,
  useAcknowledgeAlert,
  useUpdateBudget,
} from "@/features/budgets/hooks";
import {
  categoryNameMap,
  flattenExpenseCategories,
  updateBudgetSchema,
  type UpdateBudgetFormValues,
} from "@/features/budgets/schemas";
import { formatDate } from "@/lib/formatting/money";
import { ApiClientError } from "@/lib/api/client";

function BudgetAlerts({ budgetId }: { budgetId: string }) {
  const { data: alerts = [] } = useBudgetAlerts(budgetId);
  const acknowledge = useAcknowledgeAlert(budgetId);
  const openAlerts = alerts.filter((a) => !a.acknowledgedAt);
  if (openAlerts.length === 0) return null;

  return (
    <div className="space-y-2">
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

export function BudgetDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: budget, isLoading, error } = useBudget(id);
  const { data: categories = [] } = useCategories("EXPENSE");
  const expenseCategories = useMemo(() => flattenExpenseCategories(categories), [categories]);
  const names = useMemo(() => categoryNameMap(categories), [categories]);
  const update = useUpdateBudget(id);
  const archive = useArchiveBudget();

  const form = useForm<UpdateBudgetFormValues>({
    resolver: zodResolver(updateBudgetSchema),
    defaultValues: {
      totalLimit: "",
      warningThreshold: 80,
      criticalThreshold: 95,
      categories: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "categories",
  });

  useEffect(() => {
    if (!budget) return;
    form.reset({
      totalLimit: budget.totalLimit,
      warningThreshold: budget.warningThreshold,
      criticalThreshold: budget.criticalThreshold,
      categories: budget.categories.map((category) => ({
        categoryId: category.categoryId,
        limitAmount: category.limitAmount,
      })),
    });
  }, [budget, form]);

  if (isLoading) {
    return (
      <PageContainer>
        <SkeletonRows count={4} />
      </PageContainer>
    );
  }

  if (error instanceof ApiClientError && error.status === 404) {
    return (
      <PageContainer>
        <PageHeader title="Budget" description="This budget could not be found." />
        <Button asChild variant="outline">
          <Link href="/budgets">
            <ArrowLeft className="h-4 w-4" />
            Back to budgets
          </Link>
        </Button>
      </PageContainer>
    );
  }

  if (!budget) {
    return (
      <PageContainer>
        <PageHeader title="Budget" description="Unable to load this budget." />
      </PageContainer>
    );
  }

  const isArchived = !!budget.archivedAt;

  return (
    <PageContainer>
      <PageHeader
        title={`${budget.year}-${String(budget.month).padStart(2, "0")}`}
        description={
          isArchived
            ? `Archived · ${formatDate(budget.archivedAt!)}`
            : `Updated · ${formatDate(budget.updatedAt)}`
        }
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/budgets">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            {!isArchived && (
              <Button
                className="w-full sm:w-auto"
                variant="destructive"
                disabled={archive.isPending}
                onClick={async () => {
                  if (!window.confirm("Archive this budget?")) return;
                  await archive.mutateAsync(id);
                  router.push("/budgets");
                }}
              >
                <Archive className="h-4 w-4" />
                Archive
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Status
            </p>
            <BudgetStatusBadge status={budget.utilization.status} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Spent
            </p>
            <AmountDisplay amount={budget.utilization.spent} className="text-2xl font-bold" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Used
            </p>
            <PercentageDisplay
              value={budget.utilization.percentageUsed}
              className="text-2xl font-bold"
            />
          </CardContent>
        </Card>
      </div>

      {budget.categories.length > 0 && (
        <FadeIn>
          <Card>
            <CardHeader>
              <CardTitle>Category utilization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {budget.categories.map((category) => (
                <div key={category.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">
                      {names.get(category.categoryId) || category.categoryId.slice(0, 8)}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {category.utilization.spent} / {category.limitAmount}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${Math.min(100, Number(category.utilization.percentageUsed) || 0)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </FadeIn>
      )}

      <FadeIn stagger={2}>
        <Card>
          <CardHeader>
            <CardTitle>Edit budget</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(async (values) => {
                await update.mutateAsync({
                  totalLimit: values.totalLimit,
                  warningThreshold: values.warningThreshold,
                  criticalThreshold: values.criticalThreshold,
                  categories: values.categories,
                });
              })}
            >
              <fieldset disabled={isArchived || update.isPending} className="grid gap-4 sm:grid-cols-3">
                <Field
                  id="totalLimit"
                  label="Total limit"
                  error={form.formState.errors.totalLimit?.message}
                >
                  <Input inputMode="decimal" {...form.register("totalLimit")} />
                </Field>
                <Field
                  id="warningThreshold"
                  label="Warning %"
                  error={form.formState.errors.warningThreshold?.message}
                >
                  <Input type="number" {...form.register("warningThreshold")} />
                </Field>
                <Field
                  id="criticalThreshold"
                  label="Critical %"
                  error={form.formState.errors.criticalThreshold?.message}
                >
                  <Input type="number" {...form.register("criticalThreshold")} />
                </Field>
              </fieldset>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">Category limits</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isArchived}
                    onClick={() =>
                      append({
                        categoryId: expenseCategories[0]?.id || "",
                        limitAmount: "100.00",
                      })
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                {form.formState.errors.categories?.message ||
                form.formState.errors.categories?.root?.message ? (
                  <p className="text-xs font-medium text-destructive" role="alert">
                    {form.formState.errors.categories.message ||
                      form.formState.errors.categories.root?.message}
                  </p>
                ) : null}
                {fields.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Optional. Add expense categories with their own limits.
                  </p>
                )}
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid gap-3 rounded-xl border border-border/70 bg-muted/20 p-3 sm:grid-cols-[1fr_140px_auto]"
                  >
                    <Field id={`category-${index}`} label="Category">
                      <Select {...form.register(`categories.${index}.categoryId`)}>
                        <option value="">Select category</option>
                        {expenseCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field id={`limit-${index}`} label="Limit">
                      <Input
                        inputMode="decimal"
                        {...form.register(`categories.${index}.limitAmount`)}
                      />
                    </Field>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isArchived}
                        onClick={() => remove(index)}
                        aria-label="Remove category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {!isArchived && (
                <Button type="submit" disabled={update.isPending} className="w-full sm:w-auto">
                  {update.isPending ? "Saving…" : "Save changes"}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn stagger={3}>
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetAlerts budgetId={id} />
          </CardContent>
        </Card>
      </FadeIn>
    </PageContainer>
  );
}
