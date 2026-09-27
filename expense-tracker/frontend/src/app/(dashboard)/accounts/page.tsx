"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Wallet } from "lucide-react";
import { z } from "zod";
import { AmountDisplay } from "@/components/feedback/CurrencyDisplay";
import { EmptyState } from "@/components/feedback/EmptyState";
import { SkeletonRows } from "@/components/feedback/Skeleton";
import { Field } from "@/components/forms/Field";
import { FadeIn } from "@/components/motion/FadeIn";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAccounts, useCreateAccount } from "@/features/accounts/hooks";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["BANK", "CASH", "CREDIT_CARD", "DEBIT_CARD", "WALLET", "UPI"]),
  openingBalance: z.string().regex(/^\d+(\.\d{1,2})?$/, "Use amount like 100.00"),
});

type FormValues = z.infer<typeof schema>;

export default function AccountsPage() {
  const { data: accounts = [], isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const [showForm, setShowForm] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", type: "BANK", openingBalance: "0.00" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await createAccount.mutateAsync(values);
    form.reset({ name: "", type: "BANK", openingBalance: "0.00" });
    setShowForm(false);
  });

  return (
    <PageContainer>
      <PageHeader
        title="Accounts"
        description="Track balances across bank, cash, cards, and wallets."
        actions={
          <Button className="w-full sm:w-auto" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "Add account"}
          </Button>
        }
      />

      {showForm && (
        <FadeIn variant="scale">
          <Card>
            <CardHeader>
              <CardTitle>New account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-3">
                <Field id="name" label="Name" error={form.formState.errors.name?.message}>
                  <Input id="name" placeholder="HDFC Salary" {...form.register("name")} />
                </Field>
                <Field id="type" label="Type">
                  <Select id="type" {...form.register("type")}>
                    <option value="BANK">Bank</option>
                    <option value="CASH">Cash</option>
                    <option value="CREDIT_CARD">Credit card</option>
                    <option value="DEBIT_CARD">Debit card</option>
                    <option value="WALLET">Wallet</option>
                    <option value="UPI">UPI</option>
                  </Select>
                </Field>
                <Field
                  id="openingBalance"
                  label="Opening balance"
                  error={form.formState.errors.openingBalance?.message}
                >
                  <Input
                    id="openingBalance"
                    inputMode="decimal"
                    {...form.register("openingBalance")}
                  />
                </Field>
                <div className="sm:col-span-3">
                  <Button type="submit" disabled={createAccount.isPending} className="w-full sm:w-auto">
                    {createAccount.isPending ? "Creating…" : "Create account"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {isLoading && <SkeletonRows count={4} />}
      {!isLoading && accounts.length === 0 && (
        <EmptyState
          icon={Wallet}
          title="No accounts yet"
          description="Create an account to start recording expenses and transfers."
          actionLabel="Add account"
          onAction={() => setShowForm(true)}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {accounts.map((account, index) => (
          <Link
            key={account.id}
            href={`/accounts/${account.id}`}
            className="block animate-fade-up transition-transform duration-200 hover:-translate-y-0.5"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <Card className="h-full">
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                <div className="min-w-0">
                  <CardTitle className="truncate">{account.name}</CardTitle>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {account.type.replaceAll("_", " ")}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              </CardHeader>
              <CardContent>
                <AmountDisplay amount={account.currentBalance} className="text-2xl font-bold" />
                {account.archivedAt ? (
                  <p className="mt-2 text-xs text-muted-foreground">Archived</p>
                ) : null}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
