import { execSync } from "child_process";
import { afterAll, beforeAll, beforeEach } from "vitest";
import { prisma } from "../config/database";

beforeAll(() => {
  execSync("npx prisma db push --skip-generate", {
    stdio: "inherit",
    env: process.env,
  });
});

beforeEach(async () => {
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
