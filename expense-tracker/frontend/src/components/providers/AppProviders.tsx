"use client";

import { QueryProvider } from "@/lib/query/provider";
import { StoreProvider } from "@/store/StoreProvider";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <QueryProvider>
        {children}
        <Toaster richColors position="top-right" />
      </QueryProvider>
    </StoreProvider>
  );
}
