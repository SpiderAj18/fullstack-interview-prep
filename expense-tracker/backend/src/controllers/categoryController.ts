import { NextFunction, Request, Response } from "express";
import { categoryService } from "../services/categoryService";
import {
  categoryIdParamSchema,
  createCategoryBodySchema,
  listCategoriesQuerySchema,
  updateCategoryBodySchema,
} from "../validators/categorySchemas";

export const categoryController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = listCategoriesQuerySchema.parse(req.query);
      const categories = await categoryService.list(req.user!.userId, query);
      res.status(200).json({ categories });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = createCategoryBodySchema.parse(req.body);
      const category = await categoryService.create(req.user!.userId, body);
      res.status(201).json({ category });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = categoryIdParamSchema.parse(req.params);
      const body = updateCategoryBodySchema.parse(req.body);
      const category = await categoryService.update(req.user!.userId, id, body);
      res.status(200).json({ category });
    } catch (error) {
      next(error);
    }
  },

  async archive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = categoryIdParamSchema.parse(req.params);
      const category = await categoryService.archive(req.user!.userId, id);
      res.status(200).json({ category });
    } catch (error) {
      next(error);
    }
  },

  async unarchive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = categoryIdParamSchema.parse(req.params);
      const category = await categoryService.unarchive(req.user!.userId, id);
      res.status(200).json({ category });
    } catch (error) {
      next(error);
    }
  },
};
