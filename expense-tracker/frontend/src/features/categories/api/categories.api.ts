import { apiClient } from "@/lib/api/client";
import type { CategoryNode } from "@/types/api";

export const categoriesApi = {
  async list(params?: { type?: "EXPENSE" | "INCOME"; includeArchived?: boolean }) {
    const { data } = await apiClient.get<{ categories: CategoryNode[] }>("/api/v1/categories", {
      params: {
        type: params?.type,
        includeArchived: params?.includeArchived ? "true" : undefined,
      },
    });
    return data.categories;
  },

  async create(body: {
    name: string;
    type: "EXPENSE" | "INCOME";
    color?: string | null;
    parentId?: string | null;
  }) {
    const { data } = await apiClient.post<{ category: CategoryNode }>("/api/v1/categories", body);
    return data.category;
  },

  async update(id: string, body: { name?: string; color?: string | null; sortOrder?: number }) {
    const { data } = await apiClient.patch<{ category: CategoryNode }>(
      `/api/v1/categories/${id}`,
      body,
    );
    return data.category;
  },

  async archive(id: string) {
    const { data } = await apiClient.post<{ category: CategoryNode }>(
      `/api/v1/categories/${id}/archive`,
    );
    return data.category;
  },
};
