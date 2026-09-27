"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { budgetsApi } from "@/features/budgets/api/budgets.api";
import { getErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

export function useBudgets(year?: number, month?: number) {
  return useQuery({
    queryKey: queryKeys.budgets.all({ year, month }),
    queryFn: () => budgetsApi.list({ year, month }),
  });
}

export function useBudget(id?: string) {
  return useQuery({
    queryKey: queryKeys.budgets.detail(id || ""),
    queryFn: () => budgetsApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: budgetsApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget created");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useBudgetAlerts(budgetId?: string) {
  return useQuery({
    queryKey: queryKeys.budgets.alerts(budgetId || ""),
    queryFn: () => budgetsApi.listAlerts(budgetId!),
    enabled: !!budgetId,
  });
}

export function useAcknowledgeAlert(budgetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => budgetsApi.acknowledgeAlert(budgetId, alertId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgets.alerts(budgetId) });
      toast.success("Alert acknowledged");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
