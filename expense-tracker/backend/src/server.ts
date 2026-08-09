import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/database";

async function startServer() {
  const app = createApp();

  try {
    await prisma.$connect();

    app.listen(env.PORT, () => {
      console.info(
        JSON.stringify({
          message: "Expense tracker API started",
          port: env.PORT,
          environment: env.NODE_ENV,
        }),
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
