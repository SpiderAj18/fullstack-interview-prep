import { NextFunction, Request, Response } from "express";
import { transactionHistoryService } from "../services/transactionHistoryService";
import { listTransactionsQuerySchema } from "../validators/transactionSchemas";

export const transactionController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = listTransactionsQuerySchema.parse(req.query);
      const result = await transactionHistoryService.list(req.user!.userId, query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
