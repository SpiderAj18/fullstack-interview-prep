import { NextFunction, Request, Response } from "express";
import { expenseService } from "../services/expenseService";
import { idempotencyService } from "../services/idempotencyService";
import {
  createExpenseBodySchema,
  expenseIdParamSchema,
  idempotencyKeySchema,
  listExpensesQuerySchema,
  updateExpenseBodySchema,
} from "../validators/expenseSchemas";

export const expenseController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = listExpensesQuerySchema.parse(req.query);
      const result = await expenseService.list(req.user!.userId, query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = expenseIdParamSchema.parse(req.params);
      const expense = await expenseService.getById(req.user!.userId, id);
      res.status(200).json({ expense });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = createExpenseBodySchema.parse(req.body);
      const idempotencyKey = idempotencyKeySchema.parse(
        req.header("Idempotency-Key") ?? undefined,
      );

      if (idempotencyKey) {
        const replay = await idempotencyService.getReplay(
          req.user!.userId,
          idempotencyKey,
          body,
        );
        if (replay) {
          res.status(replay.statusCode).json(replay.body);
          return;
        }
      }

      const expense = await expenseService.create(req.user!.userId, body);
      const responseBody = { expense };

      if (idempotencyKey) {
        await idempotencyService.store(req.user!.userId, idempotencyKey, body, {
          statusCode: 201,
          body: responseBody,
        });
      }

      res.status(201).json(responseBody);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = expenseIdParamSchema.parse(req.params);
      const body = updateExpenseBodySchema.parse(req.body);
      const expense = await expenseService.update(req.user!.userId, id, body);
      res.status(200).json({ expense });
    } catch (error) {
      next(error);
    }
  },

  async archive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = expenseIdParamSchema.parse(req.params);
      const expense = await expenseService.archive(req.user!.userId, id);
      res.status(200).json({ expense });
    } catch (error) {
      next(error);
    }
  },

  async unarchive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = expenseIdParamSchema.parse(req.params);
      const expense = await expenseService.unarchive(req.user!.userId, id);
      res.status(200).json({ expense });
    } catch (error) {
      next(error);
    }
  },
};
