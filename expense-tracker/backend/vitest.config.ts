import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    fileParallelism: false,
    env: {
      NODE_ENV: "test",
      PORT: "3001",
      DATABASE_URL:
        "postgresql://expense:expense@localhost:5432/expense_tracker_test?schema=public",
      REDIS_URL: "redis://localhost:6379",
      JWT_SECRET: "test-secret-at-least-16-chars",
      JWT_ACCESS_EXPIRES_IN: "15m",
      JWT_REFRESH_EXPIRES_IN: "7d",
      CORS_ORIGIN: "http://localhost:5173",
    },
  },
});
