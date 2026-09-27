import { apiClient } from "@/lib/api/client";
import type { Expense, Income, Pagination, Transaction, Transfer } from "@/types/api";

export type TransactionFilters = {
  type?: "EXPENSE" | "INCOME" | "TRANSFER";
  accountId?: string;
  categoryId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export type TransactionTypeParam = "expense" | "income" | "transfer";

export type UpdateExpenseInput = {
  amount?: string;
  accountId?: string;
  categoryId?: string;
  merchant?: string | null;
  description?: string | null;
  notes?: string | null;
  paymentMethod?: string | null;
  tags?: string[];
  transactionDate?: string;
};

export type UpdateIncomeInput = {
  amount?: string;
  accountId?: string;
  categoryId?: string;
  source?: string | null;
  description?: string | null;
  notes?: string | null;
  paymentMethod?: string | null;
  tags?: string[];
  transactionDate?: string;
};

export type UpdateTransferInput = {
  amount?: string;
  fromAccountId?: string;
  toAccountId?: string;
  description?: string | null;
  notes?: string | null;
  transactionDate?: string;
};

function idempotencyKey(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function toTransactionTypeParam(
  type: "EXPENSE" | "INCOME" | "TRANSFER",
): TransactionTypeParam {
  return type.toLowerCase() as TransactionTypeParam;
}

export function fromTransactionTypeParam(
  type: string,
): "EXPENSE" | "INCOME" | "TRANSFER" | null {
  if (type === "expense") return "EXPENSE";
  if (type === "income") return "INCOME";
  if (type === "transfer") return "TRANSFER";
  return null;
}

export const transactionsApi = {
  async list(filters: TransactionFilters = {}) {
    const { data } = await apiClient.get<{
      transactions: Transaction[];
      pagination: Pagination;
    }>("/api/v1/transactions", { params: filters });
    return data;
  },

  async getExpense(id: string) {
    const { data } = await apiClient.get<{ expense: Expense }>(`/api/v1/expenses/${id}`);
    return data.expense;
  },

  async getIncome(id: string) {
    const { data } = await apiClient.get<{ income: Income }>(`/api/v1/incomes/${id}`);
    return data.income;
  },

  async getTransfer(id: string) {
    const { data } = await apiClient.get<{ transfer: Transfer }>(`/api/v1/transfers/${id}`);
    return data.transfer;
  },

  async createExpense(body: {
    amount: string;
    accountId: string;
    categoryId: string;
    merchant?: string;
    description?: string;
    transactionDate: string;
    paymentMethod?: string;
  }) {
    const { data } = await apiClient.post<{ expense: Expense }>("/api/v1/expenses", body, {
      headers: { "Idempotency-Key": idempotencyKey("expense") },
    });
    return data.expense;
  },

  async createIncome(body: {
    amount: string;
    accountId: string;
    categoryId: string;
    source?: string;
    description?: string;
    transactionDate: string;
  }) {
    const { data } = await apiClient.post<{ income: Income }>("/api/v1/incomes", body, {
      headers: { "Idempotency-Key": idempotencyKey("income") },
    });
    return data.income;
  },

  async createTransfer(body: {
    amount: string;
    fromAccountId: string;
    toAccountId: string;
    description?: string;
    transactionDate: string;
  }) {
    const { data } = await apiClient.post<{ transfer: Transfer }>("/api/v1/transfers", body, {
      headers: { "Idempotency-Key": idempotencyKey("transfer") },
    });
    return data.transfer;
  },

  async updateExpense(id: string, body: UpdateExpenseInput) {
    const { data } = await apiClient.patch<{ expense: Expense }>(`/api/v1/expenses/${id}`, body);
    return data.expense;
  },

  async updateIncome(id: string, body: UpdateIncomeInput) {
    const { data } = await apiClient.patch<{ income: Income }>(`/api/v1/incomes/${id}`, body);
    return data.income;
  },

  async updateTransfer(id: string, body: UpdateTransferInput) {
    const { data } = await apiClient.patch<{ transfer: Transfer }>(
      `/api/v1/transfers/${id}`,
      body,
    );
    return data.transfer;
  },

  async archiveExpense(id: string) {
    const { data } = await apiClient.post<{ expense: Expense }>(`/api/v1/expenses/${id}/archive`);
    return data.expense;
  },

  async archiveIncome(id: string) {
    const { data } = await apiClient.post<{ income: Income }>(`/api/v1/incomes/${id}/archive`);
    return data.income;
  },

  async archiveTransfer(id: string) {
    const { data } = await apiClient.post<{ transfer: Transfer }>(
      `/api/v1/transfers/${id}/archive`,
    );
    return data.transfer;
  },

  async unarchiveExpense(id: string) {
    const { data } = await apiClient.post<{ expense: Expense }>(
      `/api/v1/expenses/${id}/unarchive`,
    );
    return data.expense;
  },

  async unarchiveIncome(id: string) {
    const { data } = await apiClient.post<{ income: Income }>(`/api/v1/incomes/${id}/unarchive`);
    return data.income;
  },

  async unarchiveTransfer(id: string) {
    const { data } = await apiClient.post<{ transfer: Transfer }>(
      `/api/v1/transfers/${id}/unarchive`,
    );
    return data.transfer;
  },
};
