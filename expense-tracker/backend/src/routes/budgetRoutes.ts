import { Router } from "express";
import { budgetController } from "../controllers/budgetController";
import { authenticate } from "../middleware/auth";
import { requireAuth } from "../middleware/requireAuth";

export const budgetRouter = Router();

budgetRouter.use(authenticate, requireAuth);

budgetRouter.get("/", budgetController.list);
budgetRouter.post("/", budgetController.create);
budgetRouter.get("/:id", budgetController.getById);
budgetRouter.patch("/:id", budgetController.update);
budgetRouter.post("/:id/archive", budgetController.archive);
budgetRouter.post("/:id/unarchive", budgetController.unarchive);
budgetRouter.get("/:id/alerts", budgetController.listAlerts);
budgetRouter.post("/:id/alerts/:alertId/acknowledge", budgetController.acknowledgeAlert);
