"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { getErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

export function useCategories(type?: "EXPENSE" | "INCOME") {
  return useQuery({
    queryKey: queryKeys.categories.all({ type }),
    queryFn: () => categoriesApi.list({ type }),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useArchiveCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.archive,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category archived");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
