import { NextFunction, Request, Response } from "express";
import { idempotencyService } from "../services/idempotencyService";
import { transferService } from "../services/transferService";
import {
  createTransferBodySchema,
  idempotencyKeySchema,
  listTransfersQuerySchema,
  transferIdParamSchema,
  updateTransferBodySchema,
} from "../validators/transferSchemas";

export const transferController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = listTransfersQuerySchema.parse(req.query);
      const result = await transferService.list(req.user!.userId, query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = transferIdParamSchema.parse(req.params);
      const transfer = await transferService.getById(req.user!.userId, id);
      res.status(200).json({ transfer });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = createTransferBodySchema.parse(req.body);
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

      const transfer = await transferService.create(req.user!.userId, body);
      const responseBody = { transfer };

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
      const { id } = transferIdParamSchema.parse(req.params);
      const body = updateTransferBodySchema.parse(req.body);
      const transfer = await transferService.update(req.user!.userId, id, body);
      res.status(200).json({ transfer });
    } catch (error) {
      next(error);
    }
  },

  async archive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = transferIdParamSchema.parse(req.params);
      const transfer = await transferService.archive(req.user!.userId, id);
      res.status(200).json({ transfer });
    } catch (error) {
      next(error);
    }
  },

  async unarchive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = transferIdParamSchema.parse(req.params);
      const transfer = await transferService.unarchive(req.user!.userId, id);
      res.status(200).json({ transfer });
    } catch (error) {
      next(error);
    }
  },
};
