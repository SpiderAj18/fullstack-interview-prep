import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    fileParallelism: false,
    env: {
      NODE_ENV: "test",
      PORT: "3001",
      DATABASE_URL: `file:${path.resolve(__dirname, "prisma/test.db")}`,
      JWT_SECRET: "test-secret-at-least-16-chars",
      JWT_EXPIRES_IN: "1h",
      CORS_ORIGIN: "http://localhost:5173",
    },
  },
});
