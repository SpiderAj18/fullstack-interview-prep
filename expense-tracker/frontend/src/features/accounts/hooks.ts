"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { accountsApi, type UpdateAccountInput } from "@/features/accounts/api/accounts.api";
import { getErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

async function invalidateAccounts(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: ["accounts"] });
  await queryClient.invalidateQueries({ queryKey: ["account"] });
}

export function useAccounts(includeArchived = false) {
  return useQuery({
    queryKey: queryKeys.accounts.all({ includeArchived }),
    queryFn: () => accountsApi.list({ includeArchived }),
  });
}

export function useAccount(id?: string) {
  return useQuery({
    queryKey: queryKeys.accounts.detail(id || ""),
    queryFn: () => accountsApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountsApi.create,
    onSuccess: async () => {
      await invalidateAccounts(queryClient);
      toast.success("Account created");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateAccount(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateAccountInput) => accountsApi.update(id, body),
    onSuccess: async (account) => {
      queryClient.setQueryData(queryKeys.accounts.detail(id), account);
      await invalidateAccounts(queryClient);
      toast.success("Account updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useArchiveAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountsApi.archive,
    onSuccess: async () => {
      await invalidateAccounts(queryClient);
      toast.success("Account archived");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUnarchiveAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountsApi.unarchive,
    onSuccess: async () => {
      await invalidateAccounts(queryClient);
      toast.success("Account restored");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
