import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";

const app = createApp();

async function register(email: string) {
  const response = await request(app).post("/api/v1/auth/register").send({
    email,
    password: "password123",
    name: "Txn User",
  });
  expect(response.status).toBe(201);
  return response.body.accessToken as string;
}

async function seed(token: string) {
  const accounts = await request(app)
    .get("/api/v1/accounts")
    .set("Authorization", `Bearer ${token}`);
  const cashId = accounts.body.accounts[0].id as string;

  const bank = await request(app)
    .post("/api/v1/accounts")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "HDFC", type: "BANK", openingBalance: "20000.00" });
  const bankId = bank.body.account.id as string;

  const expenseCats = await request(app)
    .get("/api/v1/categories")
    .query({ type: "EXPENSE" })
    .set("Authorization", `Bearer ${token}`);
  const foodId = expenseCats.body.categories.find(
    (category: { name: string }) => category.name === "Food",
  ).id as string;

  const incomeCats = await request(app)
    .get("/api/v1/categories")
    .query({ type: "INCOME" })
    .set("Authorization", `Bearer ${token}`);
  const salaryId = incomeCats.body.categories.find(
    (category: { name: string }) => category.name === "Salary",
  ).id as string;

  await request(app)
    .post("/api/v1/expenses")
    .set("Authorization", `Bearer ${token}`)
    .send({
      amount: "250.00",
      accountId: bankId,
      categoryId: foodId,
      merchant: "Swiggy",
      transactionDate: "2026-09-20",
    });

  await request(app)
    .post("/api/v1/incomes")
    .set("Authorization", `Bearer ${token}`)
    .send({
      amount: "50000.00",
      accountId: bankId,
      categoryId: salaryId,
      source: "Acme Corp",
      transactionDate: "2026-09-01",
    });

  await request(app)
    .post("/api/v1/transfers")
    .set("Authorization", `Bearer ${token}`)
    .send({
      amount: "1000.00",
      fromAccountId: bankId,
      toAccountId: cashId,
      transactionDate: "2026-09-15",
    });

  return { bankId, cashId, foodId, salaryId };
}

describe("GET /api/v1/transactions", () => {
  it("returns a unified timeline of expenses, incomes, and transfers", async () => {
    const token = await register("txn-list@example.com");
    await seed(token);

    const response = await request(app)
      .get("/api/v1/transactions")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.transactions).toHaveLength(3);
    expect(response.body.transactions.map((txn: { type: string }) => txn.type)).toEqual([
      "EXPENSE",
      "TRANSFER",
      "INCOME",
    ]);
    expect(response.body.pagination).toMatchObject({
      page: 1,
      limit: 20,
      total: 3,
      totalPages: 1,
    });
  });

  it("filters by type, account, merchant, and amount range", async () => {
    const token = await register("txn-filter@example.com");
    const { bankId } = await seed(token);

    const byType = await request(app)
      .get("/api/v1/transactions")
      .query({ type: "TRANSFER" })
      .set("Authorization", `Bearer ${token}`);
    expect(byType.status).toBe(200);
    expect(byType.body.transactions).toHaveLength(1);
    expect(byType.body.transactions[0].type).toBe("TRANSFER");

    const byAccount = await request(app)
      .get("/api/v1/transactions")
      .query({ accountId: bankId })
      .set("Authorization", `Bearer ${token}`);
    expect(byAccount.body.transactions).toHaveLength(3);

    const byMerchant = await request(app)
      .get("/api/v1/transactions")
      .query({ merchant: "swiggy" })
      .set("Authorization", `Bearer ${token}`);
    expect(byMerchant.body.transactions).toHaveLength(1);
    expect(byMerchant.body.transactions[0].merchant).toBe("Swiggy");

    const byAmount = await request(app)
      .get("/api/v1/transactions")
      .query({ minAmount: "1000", maxAmount: "2000" })
      .set("Authorization", `Bearer ${token}`);
    expect(byAmount.body.transactions).toHaveLength(1);
    expect(byAmount.body.transactions[0].type).toBe("TRANSFER");
  });

  it("paginates results", async () => {
    const token = await register("txn-page@example.com");
    await seed(token);

    const page1 = await request(app)
      .get("/api/v1/transactions")
      .query({ page: 1, limit: 2 })
      .set("Authorization", `Bearer ${token}`);

    expect(page1.status).toBe(200);
    expect(page1.body.transactions).toHaveLength(2);
    expect(page1.body.pagination).toMatchObject({
      page: 1,
      limit: 2,
      total: 3,
      totalPages: 2,
    });

    const page2 = await request(app)
      .get("/api/v1/transactions")
      .query({ page: 2, limit: 2 })
      .set("Authorization", `Bearer ${token}`);
    expect(page2.body.transactions).toHaveLength(1);
  });

  it("rejects unauthenticated access", async () => {
    const response = await request(app).get("/api/v1/transactions");
    expect(response.status).toBe(401);
  });

  it("does not leak another user's transactions", async () => {
    const tokenA = await register("txn-owner-a@example.com");
    const tokenB = await register("txn-owner-b@example.com");
    await seed(tokenA);

    const response = await request(app)
      .get("/api/v1/transactions")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(response.status).toBe(200);
    expect(response.body.transactions).toHaveLength(0);
  });
});
