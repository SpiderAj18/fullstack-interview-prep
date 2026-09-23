import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";

const app = createApp();

async function register(email: string) {
  const response = await request(app).post("/api/v1/auth/register").send({
    email,
    password: "password123",
    name: "Expense User",
  });
  expect(response.status).toBe(201);
  return response.body.accessToken as string;
}

async function fixtures(token: string) {
  const accounts = await request(app)
    .get("/api/v1/accounts")
    .set("Authorization", `Bearer ${token}`);
  expect(accounts.status).toBe(200);

  const cash = accounts.body.accounts.find(
    (account: { name: string }) => account.name === "Cash",
  );

  const bank = await request(app)
    .post("/api/v1/accounts")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "HDFC",
      type: "BANK",
      openingBalance: "10000.00",
    });
  expect(bank.status).toBe(201);

  const categories = await request(app)
    .get("/api/v1/categories")
    .query({ type: "EXPENSE" })
    .set("Authorization", `Bearer ${token}`);
  expect(categories.status).toBe(200);

  const food = categories.body.categories.find(
    (category: { name: string }) => category.name === "Food",
  );
  const income = await request(app)
    .get("/api/v1/categories")
    .query({ type: "INCOME" })
    .set("Authorization", `Bearer ${token}`);
  const salary = income.body.categories.find(
    (category: { name: string }) => category.name === "Salary",
  );

  return {
    cashId: cash.id as string,
    bankId: bank.body.account.id as string,
    foodId: food.id as string,
    salaryId: salary.id as string,
  };
}

describe("POST /api/v1/expenses", () => {
  it("creates an expense and debits the account balance", async () => {
    const token = await register("exp-create@example.com");
    const { bankId, foodId } = await fixtures(token);

    const response = await request(app)
      .post("/api/v1/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "250.50",
        accountId: bankId,
        categoryId: foodId,
        merchant: "Swiggy",
        description: "Lunch",
        transactionDate: "2026-09-23",
        paymentMethod: "UPI",
        tags: ["food"],
      });

    expect(response.status).toBe(201);
    expect(response.body.expense).toMatchObject({
      amount: "250.50",
      accountId: bankId,
      categoryId: foodId,
      merchant: "Swiggy",
      paymentMethod: "UPI",
      tags: ["food"],
    });

    const account = await request(app)
      .get(`/api/v1/accounts/${bankId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(account.body.account.currentBalance).toBe("9749.50");
  });

  it("rejects zero and negative amounts", async () => {
    const token = await register("exp-amount@example.com");
    const { bankId, foodId } = await fixtures(token);

    const zero = await request(app)
      .post("/api/v1/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "0",
        accountId: bankId,
        categoryId: foodId,
        transactionDate: "2026-09-23",
      });
    expect(zero.status).toBe(400);

    const negative = await request(app)
      .post("/api/v1/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "-10.00",
        accountId: bankId,
        categoryId: foodId,
        transactionDate: "2026-09-23",
      });
    expect(negative.status).toBe(400);
  });

  it("rejects income categories", async () => {
    const token = await register("exp-income-cat@example.com");
    const { bankId, salaryId } = await fixtures(token);

    const response = await request(app)
      .post("/api/v1/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "100.00",
        accountId: bankId,
        categoryId: salaryId,
        transactionDate: "2026-09-23",
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects another user's account", async () => {
    const tokenA = await register("exp-owner-a@example.com");
    const tokenB = await register("exp-owner-b@example.com");
    const fixturesA = await fixtures(tokenA);
    const fixturesB = await fixtures(tokenB);

    const response = await request(app)
      .post("/api/v1/expenses")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        amount: "50.00",
        accountId: fixturesA.bankId,
        categoryId: fixturesB.foodId,
        transactionDate: "2026-09-23",
      });

    expect(response.status).toBe(404);
  });

  it("replays idempotent creates and conflicts on different body", async () => {
    const token = await register("exp-idem@example.com");
    const { bankId, foodId } = await fixtures(token);
    const payload = {
      amount: "80.00",
      accountId: bankId,
      categoryId: foodId,
      transactionDate: "2026-09-20",
      merchant: "Cafe",
    };

    const first = await request(app)
      .post("/api/v1/expenses")
      .set("Authorization", `Bearer ${token}`)
      .set("Idempotency-Key", "create-lunch-1")
      .send(payload);
    expect(first.status).toBe(201);

    const replay = await request(app)
      .post("/api/v1/expenses")
      .set("Authorization", `Bearer ${token}`)
      .set("Idempotency-Key", "create-lunch-1")
      .send(payload);
    expect(replay.status).toBe(201);
    expect(replay.body.expense.id).toBe(first.body.expense.id);

    const account = await request(app)
      .get(`/api/v1/accounts/${bankId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(account.body.account.currentBalance).toBe("9920.00");

    const conflict = await request(app)
      .post("/api/v1/expenses")
      .set("Authorization", `Bearer ${token}`)
      .set("Idempotency-Key", "create-lunch-1")
      .send({ ...payload, amount: "90.00" });
    expect(conflict.status).toBe(409);
  });

  it("rejects unauthenticated access", async () => {
    const response = await request(app).post("/api/v1/expenses").send({});
    expect(response.status).toBe(401);
  });
});

describe("GET /api/v1/expenses", () => {
  it("lists with filters and pagination", async () => {
    const token = await register("exp-list@example.com");
    const { bankId, cashId, foodId } = await fixtures(token);

    await request(app)
      .post("/api/v1/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "10.00",
        accountId: bankId,
        categoryId: foodId,
        transactionDate: "2026-09-01",
      });
    await request(app)
      .post("/api/v1/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "20.00",
        accountId: cashId,
        categoryId: foodId,
        transactionDate: "2026-09-15",
      });
    await request(app)
      .post("/api/v1/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "30.00",
        accountId: bankId,
        categoryId: foodId,
        transactionDate: "2026-09-20",
      });

    const filtered = await request(app)
      .get("/api/v1/expenses")
      .query({ accountId: bankId, from: "2026-09-10", page: 1, limit: 10 })
      .set("Authorization", `Bearer ${token}`);

    expect(filtered.status).toBe(200);
    expect(filtered.body.expenses).toHaveLength(1);
    expect(filtered.body.expenses[0].amount).toBe("30.00");
    expect(filtered.body.pagination).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });
});

describe("GET /api/v1/expenses/:id", () => {
  it("returns expense detail and hides other users", async () => {
    const tokenA = await register("exp-get-a@example.com");
    const tokenB = await register("exp-get-b@example.com");
    const { bankId, foodId } = await fixtures(tokenA);

    const created = await request(app)
      .post("/api/v1/expenses")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: "15.00",
        accountId: bankId,
        categoryId: foodId,
        transactionDate: "2026-09-12",
      });

    const own = await request(app)
      .get(`/api/v1/expenses/${created.body.expense.id}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(own.status).toBe(200);
    expect(own.body.expense.amount).toBe("15.00");

    const other = await request(app)
      .get(`/api/v1/expenses/${created.body.expense.id}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(other.status).toBe(404);
  });
});

describe("PATCH /api/v1/expenses/:id", () => {
  it("updates amount and adjusts balances across accounts", async () => {
    const token = await register("exp-patch@example.com");
    const { bankId, cashId, foodId } = await fixtures(token);

    const created = await request(app)
      .post("/api/v1/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "100.00",
        accountId: bankId,
        categoryId: foodId,
        transactionDate: "2026-09-10",
      });

    const updated = await request(app)
      .patch(`/api/v1/expenses/${created.body.expense.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: "40.00", accountId: cashId });

    expect(updated.status).toBe(200);
    expect(updated.body.expense).toMatchObject({
      amount: "40.00",
      accountId: cashId,
    });

    const bank = await request(app)
      .get(`/api/v1/accounts/${bankId}`)
      .set("Authorization", `Bearer ${token}`);
    const cash = await request(app)
      .get(`/api/v1/accounts/${cashId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(bank.body.account.currentBalance).toBe("10000.00");
    expect(cash.body.account.currentBalance).toBe("-40.00");
  });
});

describe("archive / unarchive expenses", () => {
  it("archives and restores with balance reversal", async () => {
    const token = await register("exp-archive@example.com");
    const { bankId, foodId } = await fixtures(token);

    const created = await request(app)
      .post("/api/v1/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "75.00",
        accountId: bankId,
        categoryId: foodId,
        transactionDate: "2026-09-18",
      });

    const archived = await request(app)
      .post(`/api/v1/expenses/${created.body.expense.id}/archive`)
      .set("Authorization", `Bearer ${token}`);
    expect(archived.status).toBe(200);
    expect(archived.body.expense.archivedAt).toBeTruthy();

    let account = await request(app)
      .get(`/api/v1/accounts/${bankId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(account.body.account.currentBalance).toBe("10000.00");

    const list = await request(app)
      .get("/api/v1/expenses")
      .set("Authorization", `Bearer ${token}`);
    expect(list.body.expenses).toHaveLength(0);

    const restored = await request(app)
      .post(`/api/v1/expenses/${created.body.expense.id}/unarchive`)
      .set("Authorization", `Bearer ${token}`);
    expect(restored.status).toBe(200);
    expect(restored.body.expense.archivedAt).toBeNull();

    account = await request(app)
      .get(`/api/v1/accounts/${bankId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(account.body.account.currentBalance).toBe("9925.00");
  });
});
