"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { accountsApi } from "@/features/accounts/api/accounts.api";
import { getErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

export function useAccounts(includeArchived = false) {
  return useQuery({
    queryKey: queryKeys.accounts.all({ includeArchived }),
    queryFn: () => accountsApi.list({ includeArchived }),
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountsApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account created");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useArchiveAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountsApi.archive,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account archived");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
