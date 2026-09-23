import { execSync } from "child_process";
import { afterAll, beforeAll, beforeEach } from "vitest";
import { prisma } from "../config/database";
import { connectRedis, disconnectRedis, redis } from "../config/redis";

beforeAll(async () => {
  execSync("npx prisma db push", {
    stdio: "inherit",
    env: process.env,
  });
  await connectRedis();
});

beforeEach(async () => {
  await prisma.budgetAlert.deleteMany();
  await prisma.budgetCategory.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.user.deleteMany();
  await redis.flushDb();
});

afterAll(async () => {
  await prisma.$disconnect();
  await disconnectRedis();
});
