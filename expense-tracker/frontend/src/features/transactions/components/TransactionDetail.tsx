"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Archive, RotateCcw } from "lucide-react";
import { AmountDisplay } from "@/components/feedback/CurrencyDisplay";
import { SkeletonRows } from "@/components/feedback/Skeleton";
import { TransactionTypeBadge } from "@/components/feedback/StatusBadges";
import { Field } from "@/components/forms/Field";
import { FadeIn } from "@/components/motion/FadeIn";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAccounts } from "@/features/accounts/hooks";
import { useCategories } from "@/features/categories/hooks";
import {
  useArchiveExpense,
  useArchiveIncome,
  useArchiveTransfer,
  useExpense,
  useIncome,
  useTransfer,
  useUnarchiveExpense,
  useUnarchiveIncome,
  useUnarchiveTransfer,
  useUpdateExpense,
  useUpdateIncome,
  useUpdateTransfer,
} from "@/features/transactions/hooks";
import {
  emptyToNull,
  toDateInputValue,
  updateExpenseSchema,
  updateIncomeSchema,
  updateTransferSchema,
  type UpdateExpenseFormValues,
  type UpdateIncomeFormValues,
  type UpdateTransferFormValues,
} from "@/features/transactions/schemas";
import { formatDate } from "@/lib/formatting/money";
import type { CategoryNode } from "@/types/api";
import { ApiClientError } from "@/lib/api/client";

function flattenCategories(nodes: CategoryNode[]): CategoryNode[] {
  const result: CategoryNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children?.length) {
      result.push(...flattenCategories(node.children));
    }
  }
  return result;
}

function NotFoundState({ message }: { message: string }) {
  return (
    <PageContainer>
      <PageHeader title="Transaction" description={message} />
      <Button asChild variant="outline">
        <Link href="/transactions">
          <ArrowLeft className="h-4 w-4" />
          Back to transactions
        </Link>
      </Button>
    </PageContainer>
  );
}

function ExpenseDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: expense, isLoading, error } = useExpense(id);
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories("EXPENSE");
  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);
  const update = useUpdateExpense(id);
  const archive = useArchiveExpense();
  const unarchive = useUnarchiveExpense();

  const form = useForm<UpdateExpenseFormValues>({
    resolver: zodResolver(updateExpenseSchema),
    defaultValues: {
      amount: "",
      accountId: "",
      categoryId: "",
      merchant: "",
      description: "",
      notes: "",
      transactionDate: "",
    },
  });

  useEffect(() => {
    if (!expense) return;
    form.reset({
      amount: expense.amount,
      accountId: expense.accountId,
      categoryId: expense.categoryId,
      merchant: expense.merchant ?? "",
      description: expense.description ?? "",
      notes: expense.notes ?? "",
      transactionDate: toDateInputValue(expense.transactionDate),
    });
  }, [expense, form]);

  if (isLoading) {
    return (
      <PageContainer>
        <SkeletonRows count={4} />
      </PageContainer>
    );
  }

  if (error instanceof ApiClientError && error.status === 404) {
    return <NotFoundState message="This expense could not be found." />;
  }

  if (!expense) {
    return <NotFoundState message="Unable to load this expense." />;
  }

  const isArchived = !!expense.archivedAt;

  return (
    <PageContainer>
      <PageHeader
        title="Expense details"
        description={
          isArchived
            ? `Archived · ${formatDate(expense.archivedAt!)}`
            : `Updated · ${formatDate(expense.updatedAt)}`
        }
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/transactions">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            {isArchived ? (
              <Button
                className="w-full sm:w-auto"
                variant="secondary"
                disabled={unarchive.isPending}
                onClick={async () => {
                  await unarchive.mutateAsync(id);
                }}
              >
                <RotateCcw className="h-4 w-4" />
                Restore
              </Button>
            ) : (
              <Button
                className="w-full sm:w-auto"
                variant="destructive"
                disabled={archive.isPending}
                onClick={async () => {
                  if (!window.confirm("Archive this expense? Balances will be reversed.")) return;
                  await archive.mutateAsync(id);
                  router.push("/transactions");
                }}
              >
                <Archive className="h-4 w-4" />
                Archive
              </Button>
            )}
          </div>
        }
      />

      <FadeIn>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <div className="space-y-2">
              <TransactionTypeBadge type="EXPENSE" />
              <CardTitle className="text-xl">
                <AmountDisplay amount={expense.amount} tone="expense" className="text-2xl font-bold" />
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={form.handleSubmit(async (values) => {
                await update.mutateAsync({
                  amount: values.amount,
                  accountId: values.accountId,
                  categoryId: values.categoryId,
                  merchant: emptyToNull(values.merchant),
                  description: emptyToNull(values.description),
                  notes: emptyToNull(values.notes),
                  transactionDate: values.transactionDate,
                });
              })}
            >
              <fieldset disabled={isArchived || update.isPending} className="contents">
                <Field id="amount" label="Amount" error={form.formState.errors.amount?.message}>
                  <Input inputMode="decimal" {...form.register("amount")} />
                </Field>
                <Field id="transactionDate" label="Date" error={form.formState.errors.transactionDate?.message}>
                  <Input type="date" {...form.register("transactionDate")} />
                </Field>
                <Field id="accountId" label="Account" error={form.formState.errors.accountId?.message}>
                  <Select {...form.register("accountId")}>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field id="categoryId" label="Category" error={form.formState.errors.categoryId?.message}>
                  <Select {...form.register("categoryId")}>
                    {flatCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field id="merchant" label="Merchant">
                  <Input {...form.register("merchant")} />
                </Field>
                <Field id="description" label="Description">
                  <Input {...form.register("description")} />
                </Field>
                <Field id="notes" label="Notes" className="sm:col-span-2">
                  <Textarea {...form.register("notes")} />
                </Field>
              </fieldset>
              {!isArchived && (
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={update.isPending} className="w-full sm:w-auto">
                    {update.isPending ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              )}
              {isArchived && (
                <p className="text-sm text-muted-foreground sm:col-span-2">
                  Restore this expense to edit it again.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </FadeIn>
    </PageContainer>
  );
}

function IncomeDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: income, isLoading, error } = useIncome(id);
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories("INCOME");
  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);
  const update = useUpdateIncome(id);
  const archive = useArchiveIncome();
  const unarchive = useUnarchiveIncome();

  const form = useForm<UpdateIncomeFormValues>({
    resolver: zodResolver(updateIncomeSchema),
    defaultValues: {
      amount: "",
      accountId: "",
      categoryId: "",
      source: "",
      description: "",
      notes: "",
      transactionDate: "",
    },
  });

  useEffect(() => {
    if (!income) return;
    form.reset({
      amount: income.amount,
      accountId: income.accountId,
      categoryId: income.categoryId,
      source: income.source ?? "",
      description: income.description ?? "",
      notes: income.notes ?? "",
      transactionDate: toDateInputValue(income.transactionDate),
    });
  }, [income, form]);

  if (isLoading) {
    return (
      <PageContainer>
        <SkeletonRows count={4} />
      </PageContainer>
    );
  }

  if (error instanceof ApiClientError && error.status === 404) {
    return <NotFoundState message="This income could not be found." />;
  }

  if (!income) {
    return <NotFoundState message="Unable to load this income." />;
  }

  const isArchived = !!income.archivedAt;

  return (
    <PageContainer>
      <PageHeader
        title="Income details"
        description={
          isArchived
            ? `Archived · ${formatDate(income.archivedAt!)}`
            : `Updated · ${formatDate(income.updatedAt)}`
        }
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/transactions">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            {isArchived ? (
              <Button
                className="w-full sm:w-auto"
                variant="secondary"
                disabled={unarchive.isPending}
                onClick={async () => {
                  await unarchive.mutateAsync(id);
                }}
              >
                <RotateCcw className="h-4 w-4" />
                Restore
              </Button>
            ) : (
              <Button
                className="w-full sm:w-auto"
                variant="destructive"
                disabled={archive.isPending}
                onClick={async () => {
                  if (!window.confirm("Archive this income? Balances will be reversed.")) return;
                  await archive.mutateAsync(id);
                  router.push("/transactions");
                }}
              >
                <Archive className="h-4 w-4" />
                Archive
              </Button>
            )}
          </div>
        }
      />

      <FadeIn>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <div className="space-y-2">
              <TransactionTypeBadge type="INCOME" />
              <CardTitle className="text-xl">
                <AmountDisplay amount={income.amount} tone="income" className="text-2xl font-bold" />
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={form.handleSubmit(async (values) => {
                await update.mutateAsync({
                  amount: values.amount,
                  accountId: values.accountId,
                  categoryId: values.categoryId,
                  source: emptyToNull(values.source),
                  description: emptyToNull(values.description),
                  notes: emptyToNull(values.notes),
                  transactionDate: values.transactionDate,
                });
              })}
            >
              <fieldset disabled={isArchived || update.isPending} className="contents">
                <Field id="income-amount" label="Amount" error={form.formState.errors.amount?.message}>
                  <Input inputMode="decimal" {...form.register("amount")} />
                </Field>
                <Field
                  id="income-date"
                  label="Date"
                  error={form.formState.errors.transactionDate?.message}
                >
                  <Input type="date" {...form.register("transactionDate")} />
                </Field>
                <Field
                  id="income-account"
                  label="Account"
                  error={form.formState.errors.accountId?.message}
                >
                  <Select {...form.register("accountId")}>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field
                  id="income-category"
                  label="Category"
                  error={form.formState.errors.categoryId?.message}
                >
                  <Select {...form.register("categoryId")}>
                    {flatCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field id="source" label="Source">
                  <Input {...form.register("source")} />
                </Field>
                <Field id="income-description" label="Description">
                  <Input {...form.register("description")} />
                </Field>
                <Field id="income-notes" label="Notes" className="sm:col-span-2">
                  <Textarea {...form.register("notes")} />
                </Field>
              </fieldset>
              {!isArchived && (
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={update.isPending} className="w-full sm:w-auto">
                    {update.isPending ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              )}
              {isArchived && (
                <p className="text-sm text-muted-foreground sm:col-span-2">
                  Restore this income to edit it again.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </FadeIn>
    </PageContainer>
  );
}

function TransferDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: transfer, isLoading, error } = useTransfer(id);
  const { data: accounts = [] } = useAccounts();
  const update = useUpdateTransfer(id);
  const archive = useArchiveTransfer();
  const unarchive = useUnarchiveTransfer();

  const form = useForm<UpdateTransferFormValues>({
    resolver: zodResolver(updateTransferSchema),
    defaultValues: {
      amount: "",
      fromAccountId: "",
      toAccountId: "",
      description: "",
      notes: "",
      transactionDate: "",
    },
  });

  useEffect(() => {
    if (!transfer) return;
    form.reset({
      amount: transfer.amount,
      fromAccountId: transfer.fromAccountId,
      toAccountId: transfer.toAccountId,
      description: transfer.description ?? "",
      notes: transfer.notes ?? "",
      transactionDate: toDateInputValue(transfer.transactionDate),
    });
  }, [transfer, form]);

  if (isLoading) {
    return (
      <PageContainer>
        <SkeletonRows count={4} />
      </PageContainer>
    );
  }

  if (error instanceof ApiClientError && error.status === 404) {
    return <NotFoundState message="This transfer could not be found." />;
  }

  if (!transfer) {
    return <NotFoundState message="Unable to load this transfer." />;
  }

  const isArchived = !!transfer.archivedAt;

  return (
    <PageContainer>
      <PageHeader
        title="Transfer details"
        description={
          isArchived
            ? `Archived · ${formatDate(transfer.archivedAt!)}`
            : `Updated · ${formatDate(transfer.updatedAt)}`
        }
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/transactions">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            {isArchived ? (
              <Button
                className="w-full sm:w-auto"
                variant="secondary"
                disabled={unarchive.isPending}
                onClick={async () => {
                  await unarchive.mutateAsync(id);
                }}
              >
                <RotateCcw className="h-4 w-4" />
                Restore
              </Button>
            ) : (
              <Button
                className="w-full sm:w-auto"
                variant="destructive"
                disabled={archive.isPending}
                onClick={async () => {
                  if (!window.confirm("Archive this transfer? Balances will be reversed.")) return;
                  await archive.mutateAsync(id);
                  router.push("/transactions");
                }}
              >
                <Archive className="h-4 w-4" />
                Archive
              </Button>
            )}
          </div>
        }
      />

      <FadeIn>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <div className="space-y-2">
              <TransactionTypeBadge type="TRANSFER" />
              <CardTitle className="text-xl">
                <AmountDisplay amount={transfer.amount} className="text-2xl font-bold" />
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={form.handleSubmit(async (values) => {
                await update.mutateAsync({
                  amount: values.amount,
                  fromAccountId: values.fromAccountId,
                  toAccountId: values.toAccountId,
                  description: emptyToNull(values.description),
                  notes: emptyToNull(values.notes),
                  transactionDate: values.transactionDate,
                });
              })}
            >
              <fieldset disabled={isArchived || update.isPending} className="contents">
                <Field id="transfer-amount" label="Amount" error={form.formState.errors.amount?.message}>
                  <Input inputMode="decimal" {...form.register("amount")} />
                </Field>
                <Field
                  id="transfer-date"
                  label="Date"
                  error={form.formState.errors.transactionDate?.message}
                >
                  <Input type="date" {...form.register("transactionDate")} />
                </Field>
                <Field
                  id="fromAccountId"
                  label="From"
                  error={form.formState.errors.fromAccountId?.message}
                >
                  <Select {...form.register("fromAccountId")}>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field
                  id="toAccountId"
                  label="To"
                  error={form.formState.errors.toAccountId?.message}
                >
                  <Select {...form.register("toAccountId")}>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field id="transfer-description" label="Description" className="sm:col-span-2">
                  <Input {...form.register("description")} />
                </Field>
                <Field id="transfer-notes" label="Notes" className="sm:col-span-2">
                  <Textarea {...form.register("notes")} />
                </Field>
              </fieldset>
              {!isArchived && (
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={update.isPending} className="w-full sm:w-auto">
                    {update.isPending ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              )}
              {isArchived && (
                <p className="text-sm text-muted-foreground sm:col-span-2">
                  Restore this transfer to edit it again.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </FadeIn>
    </PageContainer>
  );
}

export function TransactionDetail({
  type,
  id,
}: {
  type: "EXPENSE" | "INCOME" | "TRANSFER";
  id: string;
}) {
  if (type === "EXPENSE") return <ExpenseDetail id={id} />;
  if (type === "INCOME") return <IncomeDetail id={id} />;
  return <TransferDetail id={id} />;
}
