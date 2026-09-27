"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AmountDisplay } from "@/components/feedback/CurrencyDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccounts, useArchiveAccount, useCreateAccount } from "@/features/accounts/hooks";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["BANK", "CASH", "CREDIT_CARD", "DEBIT_CARD", "WALLET", "UPI"]),
  openingBalance: z.string().regex(/^\d+(\.\d{1,2})?$/, "Use amount like 100.00"),
});

type FormValues = z.infer<typeof schema>;

export default function AccountsPage() {
  const { data: accounts = [], isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const archiveAccount = useArchiveAccount();
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
          <p className="text-sm text-muted-foreground">Track balances across wallets and cards.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "Add account"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                  {...form.register("type")}
                >
                  <option value="BANK">Bank</option>
                  <option value="CASH">Cash</option>
                  <option value="CREDIT_CARD">Credit card</option>
                  <option value="DEBIT_CARD">Debit card</option>
                  <option value="WALLET">Wallet</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="openingBalance">Opening balance</Label>
                <Input id="openingBalance" {...form.register("openingBalance")} />
                {form.formState.errors.openingBalance && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.openingBalance.message}
                  </p>
                )}
              </div>
              <div className="md:col-span-3">
                <Button type="submit" disabled={createAccount.isPending}>
                  {createAccount.isPending ? "Creating…" : "Create account"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading accounts…</p>}
        {!isLoading && accounts.length === 0 && (
          <p className="text-sm text-muted-foreground">No accounts yet. Create one to get started.</p>
        )}
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
              <div>
                <CardTitle className="text-base">{account.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{account.type}</p>
              </div>
              {!account.isSystem && !account.archivedAt && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={archiveAccount.isPending}
                  onClick={() => archiveAccount.mutate(account.id)}
                >
                  Archive
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <AmountDisplay amount={account.currentBalance} className="text-xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
