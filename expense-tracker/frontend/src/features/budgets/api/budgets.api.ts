import { apiClient } from "@/lib/api/client";
import type { Budget, BudgetAlert } from "@/types/api";

export type BudgetCategoryInput = {
  categoryId: string;
  limitAmount: string;
};

export type CreateBudgetInput = {
  year: number;
  month: number;
  totalLimit: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  categories?: BudgetCategoryInput[];
};

export type UpdateBudgetInput = {
  totalLimit?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  categories?: BudgetCategoryInput[];
};

export const budgetsApi = {
  async list(params?: { year?: number; month?: number }) {
    const { data } = await apiClient.get<{ budgets: Budget[] }>("/api/v1/budgets", { params });
    return data.budgets;
  },

  async getById(id: string) {
    const { data } = await apiClient.get<{ budget: Budget }>(`/api/v1/budgets/${id}`);
    return data.budget;
  },

  async create(body: CreateBudgetInput) {
    const { data } = await apiClient.post<{ budget: Budget }>("/api/v1/budgets", body);
    return data.budget;
  },

  async update(id: string, body: UpdateBudgetInput) {
    const { data } = await apiClient.patch<{ budget: Budget }>(`/api/v1/budgets/${id}`, body);
    return data.budget;
  },

  async archive(id: string) {
    const { data } = await apiClient.post<{ budget: Budget }>(`/api/v1/budgets/${id}/archive`);
    return data.budget;
  },

  async listAlerts(id: string) {
    const { data } = await apiClient.get<{ alerts: BudgetAlert[] }>(
      `/api/v1/budgets/${id}/alerts`,
    );
    return data.alerts;
  },

  async acknowledgeAlert(budgetId: string, alertId: string) {
    const { data } = await apiClient.post<{ alert: BudgetAlert }>(
      `/api/v1/budgets/${budgetId}/alerts/${alertId}/acknowledge`,
    );
    return data.alert;
  },
};
