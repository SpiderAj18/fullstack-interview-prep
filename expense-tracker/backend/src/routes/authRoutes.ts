import { Router } from "express";
import { authController } from "../controllers/authController";
import { profileController } from "../controllers/profileController";
import { authenticate } from "../middleware/auth";
import { requireAuth } from "../middleware/requireAuth";

export const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);

authRouter.get("/me", authenticate, requireAuth, profileController.getMe);
authRouter.patch("/me", authenticate, requireAuth, profileController.updateMe);
authRouter.post(
  "/change-password",
  authenticate,
  requireAuth,
  profileController.changePassword,
);
