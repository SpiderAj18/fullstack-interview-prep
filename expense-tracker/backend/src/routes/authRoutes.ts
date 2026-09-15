import { Router } from "express";
import { authController } from "../controllers/authController";

export const authRouter = Router();

authRouter.post("/register", authController.register);
