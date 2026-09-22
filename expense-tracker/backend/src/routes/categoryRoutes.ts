import { Router } from "express";
import { categoryController } from "../controllers/categoryController";
import { authenticate } from "../middleware/auth";
import { requireAuth } from "../middleware/requireAuth";

export const categoryRouter = Router();

categoryRouter.use(authenticate, requireAuth);

categoryRouter.get("/", categoryController.list);
categoryRouter.post("/", categoryController.create);
categoryRouter.patch("/:id", categoryController.update);
categoryRouter.post("/:id/archive", categoryController.archive);
categoryRouter.post("/:id/unarchive", categoryController.unarchive);
