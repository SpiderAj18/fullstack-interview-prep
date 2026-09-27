"use client";

import { use } from "react";
import { BudgetDetail } from "@/features/budgets/components/BudgetDetail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function BudgetDetailPage({ params }: PageProps) {
  const { id } = use(params);
  return <BudgetDetail id={id} />;
}
