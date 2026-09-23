import { NextFunction, Request, Response } from "express";
import { idempotencyService } from "../services/idempotencyService";
import { incomeService } from "../services/incomeService";
import {
  createIncomeBodySchema,
  idempotencyKeySchema,
  incomeIdParamSchema,
  listIncomesQuerySchema,
  updateIncomeBodySchema,
} from "../validators/incomeSchemas";

export const incomeController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = listIncomesQuerySchema.parse(req.query);
      const result = await incomeService.list(req.user!.userId, query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = incomeIdParamSchema.parse(req.params);
      const income = await incomeService.getById(req.user!.userId, id);
      res.status(200).json({ income });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = createIncomeBodySchema.parse(req.body);
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

      const income = await incomeService.create(req.user!.userId, body);
      const responseBody = { income };

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
      const { id } = incomeIdParamSchema.parse(req.params);
      const body = updateIncomeBodySchema.parse(req.body);
      const income = await incomeService.update(req.user!.userId, id, body);
      res.status(200).json({ income });
    } catch (error) {
      next(error);
    }
  },

  async archive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = incomeIdParamSchema.parse(req.params);
      const income = await incomeService.archive(req.user!.userId, id);
      res.status(200).json({ income });
    } catch (error) {
      next(error);
    }
  },

  async unarchive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = incomeIdParamSchema.parse(req.params);
      const income = await incomeService.unarchive(req.user!.userId, id);
      res.status(200).json({ income });
    } catch (error) {
      next(error);
    }
  },
};
