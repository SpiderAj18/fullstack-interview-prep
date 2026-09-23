import { NextFunction, Request, Response } from "express";
import { accountService } from "../services/accountService";
import {
  accountIdParamSchema,
  createAccountBodySchema,
  listAccountsQuerySchema,
  updateAccountBodySchema,
} from "../validators/accountSchemas";

export const accountController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = listAccountsQuerySchema.parse(req.query);
      const accounts = await accountService.list(req.user!.userId, query);
      res.status(200).json({ accounts });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = accountIdParamSchema.parse(req.params);
      const account = await accountService.getById(req.user!.userId, id);
      res.status(200).json({ account });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = createAccountBodySchema.parse(req.body);
      const account = await accountService.create(req.user!.userId, body);
      res.status(201).json({ account });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = accountIdParamSchema.parse(req.params);
      const body = updateAccountBodySchema.parse(req.body);
      const account = await accountService.update(req.user!.userId, id, body);
      res.status(200).json({ account });
    } catch (error) {
      next(error);
    }
  },

  async archive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = accountIdParamSchema.parse(req.params);
      const account = await accountService.archive(req.user!.userId, id);
      res.status(200).json({ account });
    } catch (error) {
      next(error);
    }
  },

  async unarchive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = accountIdParamSchema.parse(req.params);
      const account = await accountService.unarchive(req.user!.userId, id);
      res.status(200).json({ account });
    } catch (error) {
      next(error);
    }
  },
};
