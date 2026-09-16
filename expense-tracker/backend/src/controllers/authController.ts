import { NextFunction, Request, Response } from "express";
import { authService } from "../services/authService";
import { loginBodySchema, registerBodySchema } from "../validators/authSchemas";

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

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = loginBodySchema.parse(req.body);
      const result = await authService.login(body);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
