import { NextFunction, Request, Response } from "express";
import { profileService } from "../services/profileService";
import { changePasswordBodySchema, updateProfileBodySchema } from "../validators/authSchemas";

export const profileController = {
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await profileService.getProfile(req.user!.userId);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  },

  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = updateProfileBodySchema.parse(req.body);
      const user = await profileService.updateProfile(req.user!.userId, body);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = changePasswordBodySchema.parse(req.body);
      await profileService.changePassword(req.user!.userId, body);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
