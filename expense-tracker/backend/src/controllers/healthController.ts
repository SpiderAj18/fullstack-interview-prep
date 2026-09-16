import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database";
import { redis } from "../config/redis";

export const healthController = {
  async getHealth(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let database: "up" | "down" = "down";
      let cache: "up" | "down" = "down";

      try {
        await prisma.$queryRaw`SELECT 1`;
        database = "up";
      } catch {
        database = "down";
      }

      try {
        if (redis.isOpen) {
          const pong = await redis.ping();
          cache = pong === "PONG" ? "up" : "down";
        }
      } catch {
        cache = "down";
      }

      const healthy = database === "up" && cache === "up";

      res.status(healthy ? 200 : 503).json({
        status: healthy ? "ok" : "degraded",
        service: "expense-tracker-api",
        timestamp: new Date().toISOString(),
        dependencies: {
          database,
          redis: cache,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
