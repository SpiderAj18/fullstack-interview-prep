import { Router } from "express";
import { transactionController } from "../controllers/transactionController";
import { authenticate } from "../middleware/auth";
import { requireAuth } from "../middleware/requireAuth";

export const transactionRouter = Router();

transactionRouter.use(authenticate, requireAuth);

transactionRouter.get("/", transactionController.list);
