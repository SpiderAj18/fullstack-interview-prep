import { Router } from "express";
import { accountController } from "../controllers/accountController";
import { authenticate } from "../middleware/auth";
import { requireAuth } from "../middleware/requireAuth";

export const accountRouter = Router();

accountRouter.use(authenticate, requireAuth);

accountRouter.get("/", accountController.list);
accountRouter.get("/:id", accountController.getById);
accountRouter.post("/", accountController.create);
accountRouter.patch("/:id", accountController.update);
accountRouter.post("/:id/archive", accountController.archive);
accountRouter.post("/:id/unarchive", accountController.unarchive);
