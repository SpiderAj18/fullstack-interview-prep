import {
  BudgetAlert,
  BudgetAlertStatus,
  BudgetCategory,
  CategoryType,
  Prisma,
} from "@prisma/client";
import { prisma } from "../config/database";
import {
  budgetRepository,
  type BudgetWithCategories,
} from "../repositories/budgetRepository";
import { ConflictError, NotFoundError, ValidationError } from "../utils/errors";
import type {
  CreateBudgetBody,
  ListBudgetAlertsQuery,
  ListBudgetsQuery,
  UpdateBudgetBody,
} from "../validators/budgetSchemas";

export type UtilizationStatus = "SAFE" | "WARNING" | "CRITICAL" | "EXCEEDED";

export type UtilizationSnapshot = {
  spent: string;
  remaining: string;
  percentageUsed: string;
  status: UtilizationStatus;
  limitAmount: string;
};

export type PublicBudgetCategory = {
  id: string;
  categoryId: string;
  limitAmount: string;
  utilization: UtilizationSnapshot;
};

export type PublicBudget = {
  id: string;
  year: number;
  month: number;
  totalLimit: string;
  currency: string;
  warningThreshold: number;
  criticalThreshold: number;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  utilization: UtilizationSnapshot;
  categories: PublicBudgetCategory[];
};

export type PublicBudgetAlert = {
  id: string;
  threshold: number;
  status: BudgetAlertStatus;
  scope: string;
  message: string;
  percentage: string;
  spent: string;
  limitAmount: string;
  categoryId: string | null;
  acknowledgedAt: Date | null;
  createdAt: Date;
};

function formatMoney(value: Prisma.Decimal | string | number): string {
  return new Prisma.Decimal(value).toFixed(2);
}

function monthRange(year: number, month: number): { from: Date; to: Date } {
  const from = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const to = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { from, to };
}

function computeUtilization(
  spent: Prisma.Decimal,
  limitAmount: Prisma.Decimal,
  warningThreshold: number,
  criticalThreshold: number,
): UtilizationSnapshot {
  const limit = new Prisma.Decimal(limitAmount);
  const spentAmount = new Prisma.Decimal(spent);
  const remaining = limit.minus(spentAmount);
  const percentage =
    limit.equals(0) ? new Prisma.Decimal(0) : spentAmount.div(limit).mul(100);

  let status: UtilizationStatus = "SAFE";
  if (percentage.gte(100)) {
    status = "EXCEEDED";
  } else if (percentage.gte(criticalThreshold)) {
    status = "CRITICAL";
  } else if (percentage.gte(warningThreshold)) {
    status = "WARNING";
  }

  return {
    spent: formatMoney(spentAmount),
    remaining: formatMoney(remaining),
    percentageUsed: percentage.toFixed(2),
    status,
    limitAmount: formatMoney(limit),
  };
}

async function resolveCategoryIdsWithChildren(
  userId: string,
  categoryId: string,
): Promise<string[]> {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });
  if (!category) {
    throw new NotFoundError("Category not found");
  }
  if (category.type !== CategoryType.EXPENSE) {
    throw new ValidationError("Budget categories must have type EXPENSE");
  }
  if (category.archivedAt) {
    throw new ValidationError("Cannot budget an archived category");
  }

  const children = await prisma.category.findMany({
    where: { userId, parentId: categoryId, archivedAt: null },
    select: { id: true },
  });

  return [categoryId, ...children.map((child) => child.id)];
}

async function validateCategoryInputs(
  userId: string,
  categories: Array<{ categoryId: string; limitAmount: string }>,
  totalLimit: string,
): Promise<void> {
  const uniqueIds = new Set(categories.map((category) => category.categoryId));
  if (uniqueIds.size !== categories.length) {
    throw new ValidationError("Duplicate category budgets are not allowed");
  }

  let categorySum = new Prisma.Decimal(0);
  for (const category of categories) {
    await resolveCategoryIdsWithChildren(userId, category.categoryId);
    categorySum = categorySum.plus(category.limitAmount);
  }

  if (categorySum.gt(totalLimit)) {
    throw new ValidationError(
      "Sum of category limits cannot exceed the monthly total limit",
    );
  }
}

async function buildPublicBudget(
  budget: BudgetWithCategories,
): Promise<PublicBudget> {
  const { from, to } = monthRange(budget.year, budget.month);
  const totalSpent = await budgetRepository.sumExpensesForPeriod({
    userId: budget.userId,
    from,
    to,
  });

  const totalUtilization = computeUtilization(
    totalSpent,
    budget.totalLimit,
    budget.warningThreshold,
    budget.criticalThreshold,
  );

  const categories: PublicBudgetCategory[] = [];
  for (const budgetCategory of budget.categories) {
    const categoryIds = await resolveCategoryIdsWithChildren(
      budget.userId,
      budgetCategory.categoryId,
    );
    const spent = await budgetRepository.sumExpensesForPeriod({
      userId: budget.userId,
      from,
      to,
      categoryIds,
    });
    categories.push({
      id: budgetCategory.id,
      categoryId: budgetCategory.categoryId,
      limitAmount: formatMoney(budgetCategory.limitAmount),
      utilization: computeUtilization(
        spent,
        budgetCategory.limitAmount,
        budget.warningThreshold,
        budget.criticalThreshold,
      ),
    });
  }

  await evaluateAndPersistAlerts(budget, totalUtilization, categories);

  return {
    id: budget.id,
    year: budget.year,
    month: budget.month,
    totalLimit: formatMoney(budget.totalLimit),
    currency: budget.currency,
    warningThreshold: budget.warningThreshold,
    criticalThreshold: budget.criticalThreshold,
    archivedAt: budget.archivedAt,
    createdAt: budget.createdAt,
    updatedAt: budget.updatedAt,
    utilization: totalUtilization,
    categories,
  };
}

async function evaluateAndPersistAlerts(
  budget: BudgetWithCategories,
  totalUtilization: UtilizationSnapshot,
  categories: PublicBudgetCategory[],
): Promise<void> {
  const targets: Array<{
    scope: string;
    categoryId: string | null;
    utilization: UtilizationSnapshot;
    label: string;
  }> = [
    {
      scope: "TOTAL",
      categoryId: null,
      utilization: totalUtilization,
      label: "Monthly budget",
    },
    ...categories.map((category) => ({
      scope: `CATEGORY:${category.categoryId}`,
      categoryId: category.categoryId,
      utilization: category.utilization,
      label: "Category budget",
    })),
  ];

  for (const target of targets) {
    const percentage = Number(target.utilization.percentageUsed);
    const thresholds: Array<{ threshold: number; status: BudgetAlertStatus }> = [
      { threshold: budget.warningThreshold, status: "WARNING" },
      { threshold: budget.criticalThreshold, status: "CRITICAL" },
      { threshold: 100, status: "EXCEEDED" },
    ];

    for (const item of thresholds) {
      if (percentage < item.threshold) {
        continue;
      }

      await budgetRepository.upsertAlert({
        budgetId: budget.id,
        scope: target.scope,
        threshold: item.threshold,
        status: item.status,
        message: `${target.label} reached ${item.threshold}% (${target.utilization.percentageUsed}% used)`,
        percentage: target.utilization.percentageUsed,
        spent: target.utilization.spent,
        limitAmount: target.utilization.limitAmount,
        categoryId: target.categoryId,
      });
    }
  }
}

function toPublicAlert(alert: BudgetAlert): PublicBudgetAlert {
  return {
    id: alert.id,
    threshold: alert.threshold,
    status: alert.status,
    scope: alert.scope,
    message: alert.message,
    percentage: formatMoney(alert.percentage),
    spent: formatMoney(alert.spent),
    limitAmount: formatMoney(alert.limitAmount),
    categoryId: alert.categoryId,
    acknowledgedAt: alert.acknowledgedAt,
    createdAt: alert.createdAt,
  };
}

function assertThresholdOrder(
  warning: number,
  critical: number,
): void {
  if (warning >= critical) {
    throw new ValidationError("warningThreshold must be less than criticalThreshold");
  }
  if (critical >= 100) {
    throw new ValidationError("criticalThreshold must be less than 100");
  }
}

export const budgetService = {
  async list(userId: string, query: ListBudgetsQuery): Promise<PublicBudget[]> {
    const budgets = await budgetRepository.findManyForUser({
      userId,
      year: query.year,
      month: query.month,
      includeArchived: query.includeArchived ?? false,
    });

    const result: PublicBudget[] = [];
    for (const budget of budgets) {
      result.push(await buildPublicBudget(budget));
    }
    return result;
  },

  async getById(userId: string, budgetId: string): Promise<PublicBudget> {
    const budget = await budgetRepository.findByIdForUser(budgetId, userId);
    if (!budget) {
      throw new NotFoundError("Budget not found");
    }
    return buildPublicBudget(budget);
  },

  async create(userId: string, input: CreateBudgetBody): Promise<PublicBudget> {
    assertThresholdOrder(input.warningThreshold, input.criticalThreshold);
    await validateCategoryInputs(userId, input.categories, input.totalLimit);

    const existing = await budgetRepository.findByMonthForUser(
      userId,
      input.year,
      input.month,
    );
    if (existing && !existing.archivedAt) {
      throw new ConflictError("A budget already exists for this month");
    }

    try {
      if (existing?.archivedAt) {
        const restored = await budgetRepository.update(
          existing.id,
          {
            totalLimit: input.totalLimit,
            currency: input.currency,
            warningThreshold: input.warningThreshold,
            criticalThreshold: input.criticalThreshold,
          },
          input.categories,
        );
        const active = await budgetRepository.unarchive(restored.id);
        return buildPublicBudget(active);
      }

      const created = await budgetRepository.create({
        userId,
        year: input.year,
        month: input.month,
        totalLimit: input.totalLimit,
        currency: input.currency,
        warningThreshold: input.warningThreshold,
        criticalThreshold: input.criticalThreshold,
        categories: input.categories,
      });
      return buildPublicBudget(created);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictError("A budget already exists for this month");
      }
      throw error;
    }
  },

  async update(
    userId: string,
    budgetId: string,
    input: UpdateBudgetBody,
  ): Promise<PublicBudget> {
    const existing = await budgetRepository.findByIdForUser(budgetId, userId);
    if (!existing) {
      throw new NotFoundError("Budget not found");
    }
    if (existing.archivedAt) {
      throw new ValidationError("Cannot update an archived budget");
    }

    const warning = input.warningThreshold ?? existing.warningThreshold;
    const critical = input.criticalThreshold ?? existing.criticalThreshold;
    assertThresholdOrder(warning, critical);

    const nextTotal = input.totalLimit ?? formatMoney(existing.totalLimit);
    if (input.categories) {
      await validateCategoryInputs(userId, input.categories, nextTotal);
    } else if (input.totalLimit) {
      const currentCategories = existing.categories.map((category: BudgetCategory) => ({
        categoryId: category.categoryId,
        limitAmount: formatMoney(category.limitAmount),
      }));
      await validateCategoryInputs(userId, currentCategories, nextTotal);
    }

    const updated = await budgetRepository.update(
      existing.id,
      {
        totalLimit: input.totalLimit,
        currency: input.currency,
        warningThreshold: input.warningThreshold,
        criticalThreshold: input.criticalThreshold,
      },
      input.categories,
    );

    return buildPublicBudget(updated);
  },

  async archive(userId: string, budgetId: string): Promise<PublicBudget> {
    const existing = await budgetRepository.findByIdForUser(budgetId, userId);
    if (!existing) {
      throw new NotFoundError("Budget not found");
    }
    if (existing.archivedAt) {
      return buildPublicBudget(existing);
    }
    const archived = await budgetRepository.archive(existing.id);
    return buildPublicBudget(archived);
  },

  async unarchive(userId: string, budgetId: string): Promise<PublicBudget> {
    const existing = await budgetRepository.findByIdForUser(budgetId, userId);
    if (!existing) {
      throw new NotFoundError("Budget not found");
    }
    if (!existing.archivedAt) {
      return buildPublicBudget(existing);
    }

    const conflict = await budgetRepository.findByMonthForUser(
      userId,
      existing.year,
      existing.month,
    );
    if (conflict && conflict.id !== existing.id && !conflict.archivedAt) {
      throw new ConflictError("An active budget already exists for this month");
    }

    const restored = await budgetRepository.unarchive(existing.id);
    return buildPublicBudget(restored);
  },

  async listAlerts(
    userId: string,
    budgetId: string,
    query: ListBudgetAlertsQuery,
  ): Promise<PublicBudgetAlert[]> {
    // Refresh utilization/alerts first
    await budgetService.getById(userId, budgetId);

    const alerts = await budgetRepository.listAlerts({
      budgetId,
      includeAcknowledged: query.includeAcknowledged ?? false,
    });
    return alerts.map(toPublicAlert);
  },

  async acknowledgeAlert(
    userId: string,
    budgetId: string,
    alertId: string,
  ): Promise<PublicBudgetAlert> {
    const budget = await budgetRepository.findByIdForUser(budgetId, userId);
    if (!budget) {
      throw new NotFoundError("Budget not found");
    }

    const alert = await budgetRepository.findAlertForUser(budgetId, alertId, userId);
    if (!alert) {
      throw new NotFoundError("Budget alert not found");
    }

    if (alert.acknowledgedAt) {
      return toPublicAlert(alert);
    }

    const acknowledged = await budgetRepository.acknowledgeAlert(alert.id);
    return toPublicAlert(acknowledged);
  },
};
