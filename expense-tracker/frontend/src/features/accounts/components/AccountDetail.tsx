"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Archive, ArrowLeft, ChevronRight, RotateCcw, Wallet } from "lucide-react";
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
import {
  useAccount,
  useArchiveAccount,
  useUnarchiveAccount,
  useUpdateAccount,
} from "@/features/accounts/hooks";
import { toTransactionTypeParam } from "@/features/transactions/api/transactions.api";
import { useTransactions } from "@/features/transactions/hooks";
import { formatDate } from "@/lib/formatting/money";
import { ApiClientError } from "@/lib/api/client";

const updateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  color: z
    .string()
    .regex(/^#([0-9A-Fa-f]{6})$/, "Use hex like #0D9488")
    .or(z.literal(""))
    .optional(),
});

type UpdateValues = z.infer<typeof updateSchema>;

export function AccountDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: account, isLoading, error } = useAccount(id);
  const { data: txData, isLoading: txLoading } = useTransactions({
    accountId: id,
    page: 1,
    limit: 20,
  });
  const update = useUpdateAccount(id);
  const archive = useArchiveAccount();
  const unarchive = useUnarchiveAccount();

  const form = useForm<UpdateValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: { name: "", color: "" },
  });

  useEffect(() => {
    if (!account) return;
    form.reset({
      name: account.name,
      color: account.color ?? "",
    });
  }, [account, form]);

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
        <PageHeader title="Account" description="This account could not be found." />
        <Button asChild variant="outline">
          <Link href="/accounts">
            <ArrowLeft className="h-4 w-4" />
            Back to accounts
          </Link>
        </Button>
      </PageContainer>
    );
  }

  if (!account) {
    return (
      <PageContainer>
        <PageHeader title="Account" description="Unable to load this account." />
      </PageContainer>
    );
  }

  const isArchived = !!account.archivedAt;
  const transactions = txData?.transactions ?? [];

  return (
    <PageContainer>
      <PageHeader
        title={account.name}
        description={`${account.type.replaceAll("_", " ")} · ${account.currency}`}
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/accounts">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            {!account.isSystem &&
              (isArchived ? (
                <Button
                  className="w-full sm:w-auto"
                  variant="secondary"
                  disabled={unarchive.isPending}
                  onClick={() => unarchive.mutate(id)}
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
                    if (!window.confirm("Archive this account?")) return;
                    await archive.mutateAsync(id);
                    router.push("/accounts");
                  }}
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </Button>
              ))}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="animate-fade-up">
          <CardContent className="p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Current balance
            </p>
            <AmountDisplay amount={account.currentBalance} className="mt-2 text-3xl font-bold" />
          </CardContent>
        </Card>
        <Card className="animate-fade-up stagger-2">
          <CardContent className="p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Opening balance
            </p>
            <AmountDisplay amount={account.openingBalance} className="mt-2 text-3xl font-bold" />
          </CardContent>
        </Card>
      </div>

      <FadeIn>
        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={form.handleSubmit(async (values) => {
                await update.mutateAsync({
                  name: values.name,
                  color: values.color?.trim() ? values.color.trim() : null,
                });
              })}
            >
              <fieldset disabled={isArchived || update.isPending} className="contents">
                <Field id="name" label="Name" error={form.formState.errors.name?.message}>
                  <Input id="name" {...form.register("name")} />
                </Field>
                <Field id="color" label="Color" error={form.formState.errors.color?.message}>
                  <Input id="color" placeholder="#0D9488" {...form.register("color")} />
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
                  Restore this account to edit it again.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn stagger={2}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle>Recent activity</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/transactions?accountId=${id}`}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {txLoading && <SkeletonRows count={3} />}
            {!txLoading && transactions.length === 0 && (
              <EmptyState
                icon={Wallet}
                title="No transactions yet"
                description="Activity for this account will show up here."
              />
            )}
            {transactions.map((txn) => (
              <Link
                key={`${txn.type}-${txn.id}`}
                href={`/transactions/${toTransactionTypeParam(txn.type)}/${txn.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 px-3.5 py-3 transition-colors hover:bg-muted/60"
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
                <div className="flex items-center gap-2">
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
