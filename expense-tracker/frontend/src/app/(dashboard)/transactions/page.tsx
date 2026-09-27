"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AmountDisplay } from "@/components/feedback/CurrencyDisplay";
import { TransactionTypeBadge } from "@/components/feedback/StatusBadges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccounts } from "@/features/accounts/hooks";
import { useCategories } from "@/features/categories/hooks";
import {
  useCreateExpense,
  useCreateIncome,
  useCreateTransfer,
  useTransactions,
} from "@/features/transactions/hooks";
import { formatDate } from "@/lib/formatting/money";
import type { CategoryNode } from "@/types/api";

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            Unified history for expenses, incomes, and transfers.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={mode === "EXPENSE" ? "default" : "outline"} onClick={() => setMode("EXPENSE")}>
            Expense
          </Button>
          <Button variant={mode === "INCOME" ? "default" : "outline"} onClick={() => setMode("INCOME")}>
            Income
          </Button>
          <Button
            variant={mode === "TRANSFER" ? "default" : "outline"}
            onClick={() => setMode("TRANSFER")}
          >
            Transfer
          </Button>
        </div>
      </div>

      {mode === "EXPENSE" && (
        <Card>
          <CardHeader>
            <CardTitle>Record expense</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 md:grid-cols-3"
              onSubmit={expenseForm.handleSubmit(async (values) => {
                await createExpense.mutateAsync(values);
                expenseForm.reset({ ...values, amount: "", merchant: "", description: "" });
                setMode(null);
              })}
            >
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input {...expenseForm.register("amount")} placeholder="12.50" />
              </div>
              <div className="space-y-2">
                <Label>Account</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                  {...expenseForm.register("accountId")}
                >
                  <option value="">Select account</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                  {...expenseForm.register("categoryId")}
                >
                  <option value="">Select category</option>
                  {flatExpense.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" {...expenseForm.register("transactionDate")} />
              </div>
              <div className="space-y-2">
                <Label>Merchant</Label>
                <Input {...expenseForm.register("merchant")} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input {...expenseForm.register("description")} />
              </div>
              <div className="md:col-span-3 flex gap-2">
                <Button type="submit" disabled={createExpense.isPending}>
                  Save expense
                </Button>
                <Button type="button" variant="outline" onClick={() => setMode(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {mode === "INCOME" && (
        <Card>
          <CardHeader>
            <CardTitle>Record income</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 md:grid-cols-3"
              onSubmit={incomeForm.handleSubmit(async (values) => {
                await createIncome.mutateAsync(values);
                incomeForm.reset({ ...values, amount: "", source: "", description: "" });
                setMode(null);
              })}
            >
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input {...incomeForm.register("amount")} />
              </div>
              <div className="space-y-2">
                <Label>Account</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                  {...incomeForm.register("accountId")}
                >
                  <option value="">Select account</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                  {...incomeForm.register("categoryId")}
                >
                  <option value="">Select category</option>
                  {flatIncome.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" {...incomeForm.register("transactionDate")} />
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Input {...incomeForm.register("source")} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input {...incomeForm.register("description")} />
              </div>
              <div className="md:col-span-3 flex gap-2">
                <Button type="submit" disabled={createIncome.isPending}>
                  Save income
                </Button>
                <Button type="button" variant="outline" onClick={() => setMode(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {mode === "TRANSFER" && (
        <Card>
          <CardHeader>
            <CardTitle>Record transfer</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 md:grid-cols-3"
              onSubmit={transferForm.handleSubmit(async (values) => {
                await createTransfer.mutateAsync(values);
                transferForm.reset({ ...values, amount: "", description: "" });
                setMode(null);
              })}
            >
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input {...transferForm.register("amount")} />
              </div>
              <div className="space-y-2">
                <Label>From</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                  {...transferForm.register("fromAccountId")}
                >
                  <option value="">Select account</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>To</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                  {...transferForm.register("toAccountId")}
                >
                  <option value="">Select account</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" {...transferForm.register("transactionDate")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Input {...transferForm.register("description")} />
              </div>
              <div className="md:col-span-3 flex gap-2">
                <Button type="submit" disabled={createTransfer.isPending}>
                  Save transfer
                </Button>
                <Button type="button" variant="outline" onClick={() => setMode(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        {([undefined, "EXPENSE", "INCOME", "TRANSFER"] as const).map((value) => (
          <Button
            key={String(value)}
            size="sm"
            variant={typeFilter === value ? "default" : "outline"}
            onClick={() => setTypeFilter(value)}
          >
            {value ?? "All"}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && transactions.length === 0 && (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          )}
          {transactions.map((txn) => (
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
                tone={
                  txn.type === "EXPENSE" ? "expense" : txn.type === "INCOME" ? "income" : "neutral"
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
