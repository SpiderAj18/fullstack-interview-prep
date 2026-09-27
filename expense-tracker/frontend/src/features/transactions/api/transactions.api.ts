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

function idempotencyKey(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export const transactionsApi = {
  async list(filters: TransactionFilters = {}) {
    const { data } = await apiClient.get<{
      transactions: Transaction[];
      pagination: Pagination;
    }>("/api/v1/transactions", { params: filters });
    return data;
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
};
