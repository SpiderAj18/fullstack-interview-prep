"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftRight, ChevronRight } from "lucide-react";
import { z } from "zod";
import { AmountDisplay } from "@/components/feedback/CurrencyDisplay";
import { EmptyState } from "@/components/feedback/EmptyState";
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
import { useAccounts } from "@/features/accounts/hooks";
import { useCategories } from "@/features/categories/hooks";
import {
  useCreateExpense,
  useCreateIncome,
  useCreateTransfer,
  useTransactions,
} from "@/features/transactions/hooks";
import { toTransactionTypeParam } from "@/features/transactions/api/transactions.api";
import { formatDate } from "@/lib/formatting/money";
import type { CategoryNode } from "@/types/api";
import { cn } from "@/lib/utils";

const amountSchema = z.string().regex(/^\d+(\.\d{1,2})?$/, "Use amount like 12.50");

const expenseSchema = z.object({
  amount: amountSchema,
  accountId: z.string().min(1),
  categoryId: z.string().min(1),
  merchant: z.string().optional(),
  description: z.string().optional(),
  transactionDate: z.string().min(1),
});

const incomeSchema = z.object({
  amount: amountSchema,
  accountId: z.string().min(1),
  categoryId: z.string().min(1),
  source: z.string().optional(),
  description: z.string().optional(),
  transactionDate: z.string().min(1),
});

const transferSchema = z.object({
  amount: amountSchema,
  fromAccountId: z.string().min(1),
  toAccountId: z.string().min(1),
  description: z.string().optional(),
  transactionDate: z.string().min(1),
});

type ExpenseValues = z.infer<typeof expenseSchema>;
type IncomeValues = z.infer<typeof incomeSchema>;
type TransferValues = z.infer<typeof transferSchema>;
type FormMode = "EXPENSE" | "INCOME" | "TRANSFER" | null;

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

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function TransactionsPage() {
  const [mode, setMode] = useState<FormMode>(null);
  const [typeFilter, setTypeFilter] = useState<"EXPENSE" | "INCOME" | "TRANSFER" | undefined>();
  const { data: txData, isLoading } = useTransactions({
    type: typeFilter,
    page: 1,
    limit: 25,
  });
  const { data: accounts = [] } = useAccounts();
  const { data: expenseCategories = [] } = useCategories("EXPENSE");
  const { data: incomeCategories = [] } = useCategories("INCOME");
  const createExpense = useCreateExpense();
  const createIncome = useCreateIncome();
  const createTransfer = useCreateTransfer();

  const flatExpense = useMemo(() => flattenCategories(expenseCategories), [expenseCategories]);
  const flatIncome = useMemo(() => flattenCategories(incomeCategories), [incomeCategories]);

  const expenseForm = useForm<ExpenseValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: "",
      accountId: "",
      categoryId: "",
      merchant: "",
      description: "",
      transactionDate: todayIsoDate(),
    },
  });
  const incomeForm = useForm<IncomeValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      amount: "",
      accountId: "",
      categoryId: "",
      source: "",
      description: "",
      transactionDate: todayIsoDate(),
    },
  });
  const transferForm = useForm<TransferValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      amount: "",
      fromAccountId: "",
      toAccountId: "",
      description: "",
      transactionDate: todayIsoDate(),
    },
  });

  const transactions = txData?.transactions ?? [];

  return (
    <PageContainer>
      <PageHeader
        title="Transactions"
        description="Capture expenses, income, and transfers in one place."
        actions={
          <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto">
            {(["EXPENSE", "INCOME", "TRANSFER"] as const).map((value) => (
              <Button
                key={value}
                size="sm"
                variant={mode === value ? "default" : "outline"}
                onClick={() => setMode(value)}
              >
                {value === "EXPENSE" ? "Expense" : value === "INCOME" ? "Income" : "Transfer"}
              </Button>
            ))}
          </div>
        }
      />

      {mode === "EXPENSE" && (
        <FadeIn variant="scale">
          <Card>
            <CardHeader>
              <CardTitle>Record expense</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                onSubmit={expenseForm.handleSubmit(async (values) => {
                  await createExpense.mutateAsync(values);
                  expenseForm.reset({ ...values, amount: "", merchant: "", description: "" });
                  setMode(null);
                })}
              >
                <Field id="amount" label="Amount">
                  <Input inputMode="decimal" placeholder="12.50" {...expenseForm.register("amount")} />
                </Field>
                <Field id="accountId" label="Account">
                  <Select {...expenseForm.register("accountId")}>
                    <option value="">Select account</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field id="categoryId" label="Category">
                  <Select {...expenseForm.register("categoryId")}>
                    <option value="">Select category</option>
                    {flatExpense.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field id="transactionDate" label="Date">
                  <Input type="date" {...expenseForm.register("transactionDate")} />
                </Field>
                <Field id="merchant" label="Merchant">
                  <Input {...expenseForm.register("merchant")} />
                </Field>
                <Field id="description" label="Description">
                  <Input {...expenseForm.register("description")} />
                </Field>
                <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row lg:col-span-3">
                  <Button type="submit" disabled={createExpense.isPending} className="w-full sm:w-auto">
                    Save expense
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setMode(null)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {mode === "INCOME" && (
        <FadeIn variant="scale">
          <Card>
            <CardHeader>
              <CardTitle>Record income</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                onSubmit={incomeForm.handleSubmit(async (values) => {
                  await createIncome.mutateAsync(values);
                  incomeForm.reset({ ...values, amount: "", source: "", description: "" });
                  setMode(null);
                })}
              >
                <Field id="income-amount" label="Amount">
                  <Input inputMode="decimal" {...incomeForm.register("amount")} />
                </Field>
                <Field id="income-account" label="Account">
                  <Select {...incomeForm.register("accountId")}>
                    <option value="">Select account</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field id="income-category" label="Category">
                  <Select {...incomeForm.register("categoryId")}>
                    <option value="">Select category</option>
                    {flatIncome.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field id="income-date" label="Date">
                  <Input type="date" {...incomeForm.register("transactionDate")} />
                </Field>
                <Field id="source" label="Source">
                  <Input {...incomeForm.register("source")} />
                </Field>
                <Field id="income-description" label="Description">
                  <Input {...incomeForm.register("description")} />
                </Field>
                <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row lg:col-span-3">
                  <Button type="submit" disabled={createIncome.isPending} className="w-full sm:w-auto">
                    Save income
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setMode(null)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {mode === "TRANSFER" && (
        <FadeIn variant="scale">
          <Card>
            <CardHeader>
              <CardTitle>Record transfer</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                onSubmit={transferForm.handleSubmit(async (values) => {
                  await createTransfer.mutateAsync(values);
                  transferForm.reset({ ...values, amount: "", description: "" });
                  setMode(null);
                })}
              >
                <Field id="transfer-amount" label="Amount">
                  <Input inputMode="decimal" {...transferForm.register("amount")} />
                </Field>
                <Field id="fromAccountId" label="From">
                  <Select {...transferForm.register("fromAccountId")}>
                    <option value="">Select account</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field id="toAccountId" label="To">
                  <Select {...transferForm.register("toAccountId")}>
                    <option value="">Select account</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field id="transfer-date" label="Date">
                  <Input type="date" {...transferForm.register("transactionDate")} />
                </Field>
                <Field id="transfer-description" label="Description" className="sm:col-span-2">
                  <Input {...transferForm.register("description")} />
                </Field>
                <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row lg:col-span-3">
                  <Button type="submit" disabled={createTransfer.isPending} className="w-full sm:w-auto">
                    Save transfer
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setMode(null)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {([undefined, "EXPENSE", "INCOME", "TRANSFER"] as const).map((value) => (
          <Button
            key={String(value)}
            size="sm"
            variant={typeFilter === value ? "default" : "outline"}
            className="shrink-0"
            onClick={() => setTypeFilter(value)}
          >
            {value ?? "All"}
          </Button>
        ))}
      </div>

      <FadeIn stagger={2}>
        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading && <SkeletonRows count={5} />}
            {!isLoading && transactions.length === 0 && (
              <EmptyState
                icon={ArrowLeftRight}
                title="No transactions yet"
                description="Use Expense, Income, or Transfer above to add your first entry."
              />
            )}
            {transactions.map((txn, index) => (
              <Link
                key={`${txn.type}-${txn.id}`}
                href={`/transactions/${toTransactionTypeParam(txn.type)}/${txn.id}`}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 px-3.5 py-3 transition-colors hover:bg-muted/60 animate-fade-up",
                )}
                style={{ animationDelay: `${index * 30}ms` }}
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
                    {txn.archivedAt ? " · Archived" : ""}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <AmountDisplay
                    amount={txn.amount}
                    tone={
                      txn.type === "EXPENSE"
                        ? "expense"
                        : txn.type === "INCOME"
                          ? "income"
                          : "neutral"
                    }
                    className="font-semibold"
                  />
                  <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </FadeIn>
    </PageContainer>
  );
}
