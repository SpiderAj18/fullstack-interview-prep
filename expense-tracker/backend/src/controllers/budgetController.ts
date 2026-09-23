import { NextFunction, Request, Response } from "express";
import { budgetService } from "../services/budgetService";
import {
  budgetAlertIdParamSchema,
  budgetIdParamSchema,
  createBudgetBodySchema,
  listBudgetAlertsQuerySchema,
  listBudgetsQuerySchema,
  updateBudgetBodySchema,
} from "../validators/budgetSchemas";

export const budgetController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = listBudgetsQuerySchema.parse(req.query);
      const budgets = await budgetService.list(req.user!.userId, query);
      res.status(200).json({ budgets });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = budgetIdParamSchema.parse(req.params);
      const budget = await budgetService.getById(req.user!.userId, id);
      res.status(200).json({ budget });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = createBudgetBodySchema.parse(req.body);
      const budget = await budgetService.create(req.user!.userId, body);
      res.status(201).json({ budget });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = budgetIdParamSchema.parse(req.params);
      const body = updateBudgetBodySchema.parse(req.body);
      const budget = await budgetService.update(req.user!.userId, id, body);
      res.status(200).json({ budget });
    } catch (error) {
      next(error);
    }
  },

  async archive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = budgetIdParamSchema.parse(req.params);
      const budget = await budgetService.archive(req.user!.userId, id);
      res.status(200).json({ budget });
    } catch (error) {
      next(error);
    }
  },

  async unarchive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = budgetIdParamSchema.parse(req.params);
      const budget = await budgetService.unarchive(req.user!.userId, id);
      res.status(200).json({ budget });
    } catch (error) {
      next(error);
    }
  },

  async listAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = budgetIdParamSchema.parse(req.params);
      const query = listBudgetAlertsQuerySchema.parse(req.query);
      const alerts = await budgetService.listAlerts(req.user!.userId, id, query);
      res.status(200).json({ alerts });
    } catch (error) {
      next(error);
    }
  },

  async acknowledgeAlert(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id, alertId } = budgetAlertIdParamSchema.parse(req.params);
      const alert = await budgetService.acknowledgeAlert(
        req.user!.userId,
        id,
        alertId,
      );
      res.status(200).json({ alert });
    } catch (error) {
      next(error);
    }
  },
};
