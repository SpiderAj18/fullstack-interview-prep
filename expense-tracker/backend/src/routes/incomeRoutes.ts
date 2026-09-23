import { Router } from "express";
import { incomeController } from "../controllers/incomeController";
import { authenticate } from "../middleware/auth";
import { requireAuth } from "../middleware/requireAuth";

export const incomeRouter = Router();

incomeRouter.use(authenticate, requireAuth);

incomeRouter.get("/", incomeController.list);
incomeRouter.get("/:id", incomeController.getById);
incomeRouter.post("/", incomeController.create);
incomeRouter.patch("/:id", incomeController.update);
incomeRouter.post("/:id/archive", incomeController.archive);
incomeRouter.post("/:id/unarchive", incomeController.unarchive);
