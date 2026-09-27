"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  transactionsApi,
  type TransactionFilters,
  type UpdateExpenseInput,
  type UpdateIncomeInput,
  type UpdateTransferInput,
} from "@/features/transactions/api/transactions.api";
import { getErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

async function invalidateTransactionCaches(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["transactions"] }),
    queryClient.invalidateQueries({ queryKey: ["transaction"] }),
    queryClient.invalidateQueries({ queryKey: ["accounts"] }),
    queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  ]);
}

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: queryKeys.transactions.all(filters),
    queryFn: () => transactionsApi.list(filters),
  });
}

export function useExpense(id?: string) {
  return useQuery({
    queryKey: queryKeys.transactions.detail("EXPENSE", id || ""),
    queryFn: () => transactionsApi.getExpense(id!),
    enabled: !!id,
  });
}

export function useIncome(id?: string) {
  return useQuery({
    queryKey: queryKeys.transactions.detail("INCOME", id || ""),
    queryFn: () => transactionsApi.getIncome(id!),
    enabled: !!id,
  });
}

export function useTransfer(id?: string) {
  return useQuery({
    queryKey: queryKeys.transactions.detail("TRANSFER", id || ""),
    queryFn: () => transactionsApi.getTransfer(id!),
    enabled: !!id,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.createExpense,
    onSuccess: async () => {
      await invalidateTransactionCaches(queryClient);
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
      await invalidateTransactionCaches(queryClient);
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
      await invalidateTransactionCaches(queryClient);
      toast.success("Transfer completed");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateExpense(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateExpenseInput) => transactionsApi.updateExpense(id, body),
    onSuccess: async (expense) => {
      queryClient.setQueryData(queryKeys.transactions.detail("EXPENSE", id), expense);
      await invalidateTransactionCaches(queryClient);
      toast.success("Expense updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateIncome(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateIncomeInput) => transactionsApi.updateIncome(id, body),
    onSuccess: async (income) => {
      queryClient.setQueryData(queryKeys.transactions.detail("INCOME", id), income);
      await invalidateTransactionCaches(queryClient);
      toast.success("Income updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateTransfer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateTransferInput) => transactionsApi.updateTransfer(id, body),
    onSuccess: async (transfer) => {
      queryClient.setQueryData(queryKeys.transactions.detail("TRANSFER", id), transfer);
      await invalidateTransactionCaches(queryClient);
      toast.success("Transfer updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useArchiveExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.archiveExpense,
    onSuccess: async () => {
      await invalidateTransactionCaches(queryClient);
      toast.success("Expense archived");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useArchiveIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.archiveIncome,
    onSuccess: async () => {
      await invalidateTransactionCaches(queryClient);
      toast.success("Income archived");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useArchiveTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.archiveTransfer,
    onSuccess: async () => {
      await invalidateTransactionCaches(queryClient);
      toast.success("Transfer archived");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUnarchiveExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.unarchiveExpense,
    onSuccess: async () => {
      await invalidateTransactionCaches(queryClient);
      toast.success("Expense restored");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUnarchiveIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.unarchiveIncome,
    onSuccess: async () => {
      await invalidateTransactionCaches(queryClient);
      toast.success("Income restored");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUnarchiveTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.unarchiveTransfer,
    onSuccess: async () => {
      await invalidateTransactionCaches(queryClient);
      toast.success("Transfer restored");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
