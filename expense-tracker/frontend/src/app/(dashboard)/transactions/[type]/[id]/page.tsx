"use client";

import { use } from "react";
import { TransactionDetail } from "@/features/transactions/components/TransactionDetail";
import { fromTransactionTypeParam } from "@/features/transactions/api/transactions.api";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type PageProps = {
  params: Promise<{ type: string; id: string }>;
};

export default function TransactionDetailPage({ params }: PageProps) {
  const { type, id } = use(params);
  const resolvedType = fromTransactionTypeParam(type);

  if (!resolvedType) {
    return (
      <PageContainer>
        <PageHeader
          title="Unknown transaction type"
          description="Use expense, income, or transfer in the URL."
        />
        <Button asChild variant="outline">
          <Link href="/transactions">Back to transactions</Link>
        </Button>
      </PageContainer>
    );
  }

  return <TransactionDetail type={resolvedType} id={id} />;
}
