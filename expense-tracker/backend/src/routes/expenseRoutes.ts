import { Router } from "express";
import { expenseController } from "../controllers/expenseController";
import { authenticate } from "../middleware/auth";
import { requireAuth } from "../middleware/requireAuth";

export const expenseRouter = Router();

expenseRouter.use(authenticate, requireAuth);

expenseRouter.get("/", expenseController.list);
expenseRouter.get("/:id", expenseController.getById);
expenseRouter.post("/", expenseController.create);
expenseRouter.patch("/:id", expenseController.update);
expenseRouter.post("/:id/archive", expenseController.archive);
expenseRouter.post("/:id/unarchive", expenseController.unarchive);
