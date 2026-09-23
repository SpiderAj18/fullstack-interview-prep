import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { requestIdMiddleware, requestLogger } from "./middleware/requestContext";
import { accountRouter } from "./routes/accountRoutes";
import { authRouter } from "./routes/authRoutes";
import { categoryRouter } from "./routes/categoryRoutes";
import { expenseRouter } from "./routes/expenseRoutes";
import { healthRouter } from "./routes/healthRoutes";
import { incomeRouter } from "./routes/incomeRoutes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(requestIdMiddleware);
  app.use(requestLogger);

  app.get("/", (_req, res) => {
    res.json({
      name: "Expense Tracker API",
      version: "0.1.0",
      docs: "/api/v1/health",
    });
  });

  app.use("/api/v1/health", healthRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/categories", categoryRouter);
  app.use("/api/v1/accounts", accountRouter);
  app.use("/api/v1/expenses", expenseRouter);
  app.use("/api/v1/incomes", incomeRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
