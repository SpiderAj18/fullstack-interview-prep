import { healthController } from "../controllers/healthController";

import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", healthController.getHealth);
