import { NextFunction, Request, Response } from "express";
import { authService } from "../services/authService";
import { registerBodySchema } from "../validators/authSchemas";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = registerBodySchema.parse(req.body);
      const result = await authService.register(body);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
};
