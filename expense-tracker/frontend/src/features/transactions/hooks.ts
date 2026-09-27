"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  transactionsApi,
  type TransactionFilters,
} from "@/features/transactions/api/transactions.api";
import { getErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: queryKeys.transactions.all(filters),
    queryFn: () => transactionsApi.list(filters),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.createExpense,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["transactions"] }),
        queryClient.invalidateQueries({ queryKey: ["accounts"] }),
        queryClient.invalidateQueries({ queryKey: ["budgets"] }),
      ]);
      toast.success("Expense recorded");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.createIncome,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["transactions"] }),
        queryClient.invalidateQueries({ queryKey: ["accounts"] }),
      ]);
      toast.success("Income recorded");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.createTransfer,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["transactions"] }),
        queryClient.invalidateQueries({ queryKey: ["accounts"] }),
      ]);
      toast.success("Transfer completed");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
