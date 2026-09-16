import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/database";
import { connectRedis, disconnectRedis } from "./config/redis";

async function startServer() {
  const app = createApp();

  try {
    await prisma.$connect();
    await connectRedis();

    const server = app.listen(env.PORT, () => {
      console.info(
        JSON.stringify({
          message: "Expense tracker API started",
          port: env.PORT,
          environment: env.NODE_ENV,
        }),
      );
    });

    const shutdown = async (signal: string) => {
      console.info(JSON.stringify({ message: "Shutting down", signal }));
      server.close(async () => {
        await prisma.$disconnect();
        await disconnectRedis();
        process.exit(0);
      });
    };

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });
    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect().catch(() => undefined);
    await disconnectRedis().catch(() => undefined);
    process.exit(1);
  }
}

startServer();
