"use client";

import { use } from "react";
import { AccountDetail } from "@/features/accounts/components/AccountDetail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function AccountDetailPage({ params }: PageProps) {
  const { id } = use(params);
  return <AccountDetail id={id} />;
}
