import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { requestIdMiddleware, requestLogger } from "./middleware/requestContext";
import { healthRouter } from "./routes/healthRoutes";

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

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
