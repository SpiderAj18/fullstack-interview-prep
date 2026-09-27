import { apiClient } from "@/lib/api/client";
import type { Account } from "@/types/api";

export type UpdateAccountInput = {
  name?: string;
  color?: string | null;
  icon?: string | null;
  sortOrder?: number;
};

export const accountsApi = {
  async list(params?: { type?: string; includeArchived?: boolean }) {
    const { data } = await apiClient.get<{ accounts: Account[] }>("/api/v1/accounts", {
      params: {
        type: params?.type,
        includeArchived: params?.includeArchived ? "true" : undefined,
      },
    });
    return data.accounts;
  },

  async getById(id: string) {
    const { data } = await apiClient.get<{ account: Account }>(`/api/v1/accounts/${id}`);
    return data.account;
  },

  async create(body: {
    name: string;
    type: string;
    openingBalance?: string;
    currency?: string;
    color?: string | null;
  }) {
    const { data } = await apiClient.post<{ account: Account }>("/api/v1/accounts", body);
    return data.account;
  },

  async update(id: string, body: UpdateAccountInput) {
    const { data } = await apiClient.patch<{ account: Account }>(`/api/v1/accounts/${id}`, body);
    return data.account;
  },

  async archive(id: string) {
    const { data } = await apiClient.post<{ account: Account }>(`/api/v1/accounts/${id}/archive`);
    return data.account;
  },

  async unarchive(id: string) {
    const { data } = await apiClient.post<{ account: Account }>(
      `/api/v1/accounts/${id}/unarchive`,
    );
    return data.account;
  },
};
