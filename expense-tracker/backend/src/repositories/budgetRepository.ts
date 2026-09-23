import {
  Budget,
  BudgetAlert,
  BudgetAlertStatus,
  BudgetCategory,
  Prisma,
} from "@prisma/client";
import { prisma } from "../config/database";

export type BudgetWithCategories = Budget & {
  categories: BudgetCategory[];
};

export type CreateBudgetInput = {
  userId: string;
  year: number;
  month: number;
  totalLimit: Prisma.Decimal | string | number;
  currency: string;
  warningThreshold: number;
  criticalThreshold: number;
  categories: Array<{ categoryId: string; limitAmount: string }>;
};

export type UpdateBudgetInput = {
  totalLimit?: Prisma.Decimal | string | number;
  currency?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
};

export const budgetRepository = {
  async findByIdForUser(
    id: string,
    userId: string,
  ): Promise<BudgetWithCategories | null> {
    return prisma.budget.findFirst({
      where: { id, userId },
      include: { categories: true },
    });
  },

  async findByMonthForUser(
    userId: string,
    year: number,
    month: number,
  ): Promise<BudgetWithCategories | null> {
    return prisma.budget.findFirst({
      where: { userId, year, month },
      include: { categories: true },
    });
  },

  async findManyForUser(input: {
    userId: string;
    year?: number;
    month?: number;
    includeArchived: boolean;
  }): Promise<BudgetWithCategories[]> {
    return prisma.budget.findMany({
      where: {
        userId: input.userId,
        ...(input.year !== undefined ? { year: input.year } : {}),
        ...(input.month !== undefined ? { month: input.month } : {}),
        ...(input.includeArchived ? {} : { archivedAt: null }),
      },
      include: { categories: true },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
  },

  async create(input: CreateBudgetInput): Promise<BudgetWithCategories> {
    return prisma.budget.create({
      data: {
        userId: input.userId,
        year: input.year,
        month: input.month,
        totalLimit: input.totalLimit,
        currency: input.currency,
        warningThreshold: input.warningThreshold,
        criticalThreshold: input.criticalThreshold,
        categories: {
          create: input.categories.map((category) => ({
            categoryId: category.categoryId,
            limitAmount: category.limitAmount,
          })),
        },
      },
      include: { categories: true },
    });
  },

  async update(
    id: string,
    input: UpdateBudgetInput,
    categories?: Array<{ categoryId: string; limitAmount: string }>,
  ): Promise<BudgetWithCategories> {
    return prisma.$transaction(async (tx) => {
      if (categories) {
        await tx.budgetCategory.deleteMany({ where: { budgetId: id } });
        if (categories.length > 0) {
          await tx.budgetCategory.createMany({
            data: categories.map((category) => ({
              budgetId: id,
              categoryId: category.categoryId,
              limitAmount: category.limitAmount,
            })),
          });
        }
      }

      return tx.budget.update({
        where: { id },
        data: {
          ...(input.totalLimit !== undefined ? { totalLimit: input.totalLimit } : {}),
          ...(input.currency !== undefined ? { currency: input.currency } : {}),
          ...(input.warningThreshold !== undefined
            ? { warningThreshold: input.warningThreshold }
            : {}),
          ...(input.criticalThreshold !== undefined
            ? { criticalThreshold: input.criticalThreshold }
            : {}),
        },
        include: { categories: true },
      });
    });
  },

  async archive(id: string): Promise<BudgetWithCategories> {
    return prisma.budget.update({
      where: { id },
      data: { archivedAt: new Date() },
      include: { categories: true },
    });
  },

  async unarchive(id: string): Promise<BudgetWithCategories> {
    return prisma.budget.update({
      where: { id },
      data: { archivedAt: null },
      include: { categories: true },
    });
  },

  async sumExpensesForPeriod(input: {
    userId: string;
    from: Date;
    to: Date;
    categoryIds?: string[];
  }): Promise<Prisma.Decimal> {
    const result = await prisma.expense.aggregate({
      where: {
        userId: input.userId,
        archivedAt: null,
        transactionDate: { gte: input.from, lte: input.to },
        ...(input.categoryIds
          ? { categoryId: { in: input.categoryIds } }
          : {}),
      },
      _sum: { amount: true },
    });

    return result._sum.amount ?? new Prisma.Decimal(0);
  },

  async listAlerts(input: {
    budgetId: string;
    includeAcknowledged: boolean;
  }): Promise<BudgetAlert[]> {
    return prisma.budgetAlert.findMany({
      where: {
        budgetId: input.budgetId,
        ...(input.includeAcknowledged ? {} : { acknowledgedAt: null }),
      },
      orderBy: [{ createdAt: "desc" }],
    });
  },

  async findAlertForUser(
    budgetId: string,
    alertId: string,
    userId: string,
  ): Promise<BudgetAlert | null> {
    return prisma.budgetAlert.findFirst({
      where: {
        id: alertId,
        budgetId,
        budget: { userId },
      },
    });
  },

  async acknowledgeAlert(alertId: string): Promise<BudgetAlert> {
    return prisma.budgetAlert.update({
      where: { id: alertId },
      data: { acknowledgedAt: new Date() },
    });
  },

  async upsertAlert(input: {
    budgetId: string;
    scope: string;
    threshold: number;
    status: BudgetAlertStatus;
    message: string;
    percentage: Prisma.Decimal | string | number;
    spent: Prisma.Decimal | string | number;
    limitAmount: Prisma.Decimal | string | number;
    categoryId?: string | null;
  }): Promise<BudgetAlert> {
    return prisma.budgetAlert.upsert({
      where: {
        budgetId_scope_threshold: {
          budgetId: input.budgetId,
          scope: input.scope,
          threshold: input.threshold,
        },
      },
      create: {
        budgetId: input.budgetId,
        scope: input.scope,
        threshold: input.threshold,
        status: input.status,
        message: input.message,
        percentage: input.percentage,
        spent: input.spent,
        limitAmount: input.limitAmount,
        categoryId: input.categoryId ?? null,
      },
      update: {
        status: input.status,
        message: input.message,
        percentage: input.percentage,
        spent: input.spent,
        limitAmount: input.limitAmount,
        categoryId: input.categoryId ?? null,
      },
    });
  },
};
