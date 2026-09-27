export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  accounts: {
    all: (filters?: Record<string, unknown>) => ["accounts", filters] as const,
    detail: (id: string) => ["account", id] as const,
  },
  categories: {
    all: (filters?: Record<string, unknown>) => ["categories", filters] as const,
  },
  transactions: {
    all: (filters?: Record<string, unknown>) => ["transactions", filters] as const,
  },
  budgets: {
    all: (filters?: Record<string, unknown>) => ["budgets", filters] as const,
    detail: (id: string) => ["budget", id] as const,
    alerts: (id: string) => ["budget", id, "alerts"] as const,
  },
};
