import { Router } from "express";
import { transferController } from "../controllers/transferController";
import { authenticate } from "../middleware/auth";
import { requireAuth } from "../middleware/requireAuth";

export const transferRouter = Router();

transferRouter.use(authenticate, requireAuth);

transferRouter.get("/", transferController.list);
transferRouter.get("/:id", transferController.getById);
transferRouter.post("/", transferController.create);
transferRouter.patch("/:id", transferController.update);
transferRouter.post("/:id/archive", transferController.archive);
transferRouter.post("/:id/unarchive", transferController.unarchive);
