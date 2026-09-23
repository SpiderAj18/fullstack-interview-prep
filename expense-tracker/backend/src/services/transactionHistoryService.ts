import { Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import type {
  ListTransactionsQuery,
  TransactionType,
} from "../validators/transactionSchemas";

export type PublicTransaction = {
  id: string;
  type: TransactionType;
  amount: string;
  transactionDate: Date;
  archivedAt: Date | null;
  description: string | null;
  accountId: string | null;
  fromAccountId: string | null;
  toAccountId: string | null;
  categoryId: string | null;
  merchant: string | null;
  source: string | null;
  createdAt: Date;
};

export type PaginatedTransactions = {
  transactions: PublicTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type RawTransactionRow = {
  id: string;
  type: TransactionType;
  amount: Prisma.Decimal | string;
  transactionDate: Date;
  archivedAt: Date | null;
  description: string | null;
  accountId: string | null;
  fromAccountId: string | null;
  toAccountId: string | null;
  categoryId: string | null;
  merchant: string | null;
  source: string | null;
  createdAt: Date;
};

function formatMoney(value: Prisma.Decimal | string | number): string {
  return new Prisma.Decimal(value).toFixed(2);
}

function toPublic(row: RawTransactionRow): PublicTransaction {
  return {
    id: row.id,
    type: row.type,
    amount: formatMoney(row.amount),
    transactionDate: row.transactionDate,
    archivedAt: row.archivedAt,
    description: row.description,
    accountId: row.accountId,
    fromAccountId: row.fromAccountId,
    toAccountId: row.toAccountId,
    categoryId: row.categoryId,
    merchant: row.merchant,
    source: row.source,
    createdAt: row.createdAt,
  };
}

function buildExpenseWhere(
  userId: string,
  query: ListTransactionsQuery,
): Prisma.Sql {
  const parts: Prisma.Sql[] = [Prisma.sql`e."userId" = ${userId}`];

  if (!query.includeArchived) {
    parts.push(Prisma.sql`e."archivedAt" IS NULL`);
  }
  if (query.from) {
    parts.push(Prisma.sql`e."transactionDate" >= ${query.from}`);
  }
  if (query.to) {
    parts.push(Prisma.sql`e."transactionDate" <= ${query.to}`);
  }
  if (query.accountId) {
    parts.push(Prisma.sql`e."accountId" = ${query.accountId}`);
  }
  if (query.categoryId) {
    parts.push(Prisma.sql`e."categoryId" = ${query.categoryId}`);
  }
  if (query.merchant) {
    parts.push(Prisma.sql`e.merchant ILIKE ${`%${query.merchant}%`}`);
  }
  if (query.minAmount) {
    parts.push(Prisma.sql`e.amount >= ${query.minAmount}::decimal`);
  }
  if (query.maxAmount) {
    parts.push(Prisma.sql`e.amount <= ${query.maxAmount}::decimal`);
  }

  return Prisma.join(parts, " AND ");
}

function buildIncomeWhere(
  userId: string,
  query: ListTransactionsQuery,
): Prisma.Sql {
  const parts: Prisma.Sql[] = [Prisma.sql`i."userId" = ${userId}`];

  if (!query.includeArchived) {
    parts.push(Prisma.sql`i."archivedAt" IS NULL`);
  }
  if (query.from) {
    parts.push(Prisma.sql`i."transactionDate" >= ${query.from}`);
  }
  if (query.to) {
    parts.push(Prisma.sql`i."transactionDate" <= ${query.to}`);
  }
  if (query.accountId) {
    parts.push(Prisma.sql`i."accountId" = ${query.accountId}`);
  }
  if (query.categoryId) {
    parts.push(Prisma.sql`i."categoryId" = ${query.categoryId}`);
  }
  if (query.merchant) {
    // Merchant filter also matches income source labels
    parts.push(Prisma.sql`i.source ILIKE ${`%${query.merchant}%`}`);
  }
  if (query.minAmount) {
    parts.push(Prisma.sql`i.amount >= ${query.minAmount}::decimal`);
  }
  if (query.maxAmount) {
    parts.push(Prisma.sql`i.amount <= ${query.maxAmount}::decimal`);
  }

  return Prisma.join(parts, " AND ");
}

function buildTransferWhere(
  userId: string,
  query: ListTransactionsQuery,
): Prisma.Sql | null {
  // Transfers have no category/merchant — skip branch when those filters are set
  if (query.categoryId || query.merchant) {
    return null;
  }

  const parts: Prisma.Sql[] = [Prisma.sql`t."userId" = ${userId}`];

  if (!query.includeArchived) {
    parts.push(Prisma.sql`t."archivedAt" IS NULL`);
  }
  if (query.from) {
    parts.push(Prisma.sql`t."transactionDate" >= ${query.from}`);
  }
  if (query.to) {
    parts.push(Prisma.sql`t."transactionDate" <= ${query.to}`);
  }
  if (query.accountId) {
    parts.push(
      Prisma.sql`(t."fromAccountId" = ${query.accountId} OR t."toAccountId" = ${query.accountId})`,
    );
  }
  if (query.minAmount) {
    parts.push(Prisma.sql`t.amount >= ${query.minAmount}::decimal`);
  }
  if (query.maxAmount) {
    parts.push(Prisma.sql`t.amount <= ${query.maxAmount}::decimal`);
  }

  return Prisma.join(parts, " AND ");
}

function expenseSelect(where: Prisma.Sql): Prisma.Sql {
  return Prisma.sql`
    SELECT
      e.id,
      'EXPENSE'::text AS type,
      e.amount,
      e."transactionDate",
      e."archivedAt",
      e.description,
      e."accountId",
      NULL::text AS "fromAccountId",
      NULL::text AS "toAccountId",
      e."categoryId",
      e.merchant,
      NULL::text AS source,
      e."createdAt"
    FROM "Expense" e
    WHERE ${where}
  `;
}

function incomeSelect(where: Prisma.Sql): Prisma.Sql {
  return Prisma.sql`
    SELECT
      i.id,
      'INCOME'::text AS type,
      i.amount,
      i."transactionDate",
      i."archivedAt",
      i.description,
      i."accountId",
      NULL::text AS "fromAccountId",
      NULL::text AS "toAccountId",
      i."categoryId",
      NULL::text AS merchant,
      i.source,
      i."createdAt"
    FROM "Income" i
    WHERE ${where}
  `;
}

function transferSelect(where: Prisma.Sql): Prisma.Sql {
  return Prisma.sql`
    SELECT
      t.id,
      'TRANSFER'::text AS type,
      t.amount,
      t."transactionDate",
      t."archivedAt",
      t.description,
      NULL::text AS "accountId",
      t."fromAccountId",
      t."toAccountId",
      NULL::text AS "categoryId",
      NULL::text AS merchant,
      NULL::text AS source,
      t."createdAt"
    FROM "Transfer" t
    WHERE ${where}
  `;
}

function buildUnion(userId: string, query: ListTransactionsQuery): Prisma.Sql | null {
  const branches: Prisma.Sql[] = [];
  const type = query.type;

  if (!type || type === "EXPENSE") {
    branches.push(expenseSelect(buildExpenseWhere(userId, query)));
  }
  if (!type || type === "INCOME") {
    branches.push(incomeSelect(buildIncomeWhere(userId, query)));
  }
  if (!type || type === "TRANSFER") {
    const transferWhere = buildTransferWhere(userId, query);
    if (transferWhere) {
      branches.push(transferSelect(transferWhere));
    }
  }

  if (branches.length === 0) {
    return null;
  }

  return Prisma.join(branches, " UNION ALL ");
}

export const transactionHistoryService = {
  async list(
    userId: string,
    query: ListTransactionsQuery,
  ): Promise<PaginatedTransactions> {
    const page = query.page;
    const limit = query.limit;
    const offset = (page - 1) * limit;
    const union = buildUnion(userId, query);

    if (!union) {
      return {
        transactions: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }

    const [rows, countRows] = await Promise.all([
      prisma.$queryRaw<RawTransactionRow[]>`
        ${union}
        ORDER BY "transactionDate" DESC, id DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      prisma.$queryRaw<Array<{ total: bigint | number }>>`
        SELECT COUNT(*)::bigint AS total FROM (${union}) AS combined
      `,
    ]);

    const total = Number(countRows[0]?.total ?? 0);

    return {
      transactions: rows.map(toPublic),
      pagination: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  },
};
