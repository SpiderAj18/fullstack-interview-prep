export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
};

export type NormalizedApiError = {
  message: string;
  code: string;
  status: number;
  requestId?: string;
  details?: unknown;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Account = {
  id: string;
  name: string;
  type: string;
  currency: string;
  color: string | null;
  icon: string | null;
  sortOrder: number;
  openingBalance: string;
  currentBalance: string;
  isSystem: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CategoryNode = {
  id: string;
  name: string;
  type: "EXPENSE" | "INCOME";
  color: string | null;
  icon: string | null;
  sortOrder: number;
  isSystem: boolean;
  archivedAt: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  children: CategoryNode[];
};

export type Transaction = {
  id: string;
  type: "EXPENSE" | "INCOME" | "TRANSFER";
  amount: string;
  transactionDate: string;
  archivedAt: string | null;
  description: string | null;
  accountId: string | null;
  fromAccountId: string | null;
  toAccountId: string | null;
  categoryId: string | null;
  merchant: string | null;
  source: string | null;
  createdAt: string;
};

export type Expense = {
  id: string;
  amount: string;
  merchant: string | null;
  description: string | null;
  notes: string | null;
  paymentMethod: string | null;
  tags: string[];
  transactionDate: string;
  archivedAt: string | null;
  accountId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
};

export type Income = {
  id: string;
  amount: string;
  source: string | null;
  description: string | null;
  notes: string | null;
  paymentMethod: string | null;
  tags: string[];
  transactionDate: string;
  archivedAt: string | null;
  accountId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
};

export type Transfer = {
  id: string;
  amount: string;
  description: string | null;
  notes: string | null;
  transactionDate: string;
  archivedAt: string | null;
  fromAccountId: string;
  toAccountId: string;
  createdAt: string;
  updatedAt: string;
};

export type UtilizationSnapshot = {
  spent: string;
  remaining: string;
  percentageUsed: string;
  status: "SAFE" | "WARNING" | "CRITICAL" | "EXCEEDED";
  limitAmount: string;
};

export type BudgetCategory = {
  id: string;
  categoryId: string;
  limitAmount: string;
  utilization: UtilizationSnapshot;
};

export type Budget = {
  id: string;
  year: number;
  month: number;
  totalLimit: string;
  currency: string;
  warningThreshold: number;
  criticalThreshold: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  utilization: UtilizationSnapshot;
  categories: BudgetCategory[];
};

export type BudgetAlert = {
  id: string;
  threshold: number;
  status: "WARNING" | "CRITICAL" | "EXCEEDED";
  scope: string;
  message: string;
  percentage: string;
  spent: string;
  limitAmount: string;
  categoryId: string | null;
  acknowledgedAt: string | null;
  createdAt: string;
};
