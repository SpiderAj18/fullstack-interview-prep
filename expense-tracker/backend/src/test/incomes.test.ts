import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";

const app = createApp();

async function register(email: string) {
  const response = await request(app).post("/api/v1/auth/register").send({
    email,
    password: "password123",
    name: "Income User",
  });
  expect(response.status).toBe(201);
  return response.body.accessToken as string;
}

async function fixtures(token: string) {
  const accounts = await request(app)
    .get("/api/v1/accounts")
    .set("Authorization", `Bearer ${token}`);
  const cash = accounts.body.accounts.find(
    (account: { name: string }) => account.name === "Cash",
  );

  const bank = await request(app)
    .post("/api/v1/accounts")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Salary Bank", type: "BANK", openingBalance: "1000.00" });
  expect(bank.status).toBe(201);

  const incomeCats = await request(app)
    .get("/api/v1/categories")
    .query({ type: "INCOME" })
    .set("Authorization", `Bearer ${token}`);
  const salary = incomeCats.body.categories.find(
    (category: { name: string }) => category.name === "Salary",
  );

  const expenseCats = await request(app)
    .get("/api/v1/categories")
    .query({ type: "EXPENSE" })
    .set("Authorization", `Bearer ${token}`);
  const food = expenseCats.body.categories.find(
    (category: { name: string }) => category.name === "Food",
  );

  return {
    cashId: cash.id as string,
    bankId: bank.body.account.id as string,
    salaryId: salary.id as string,
    foodId: food.id as string,
  };
}

describe("POST /api/v1/incomes", () => {
  it("creates income and credits the account balance", async () => {
    const token = await register("inc-create@example.com");
    const { bankId, salaryId } = await fixtures(token);

    const response = await request(app)
      .post("/api/v1/incomes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "50000.00",
        accountId: bankId,
        categoryId: salaryId,
        source: "Acme Corp",
        transactionDate: "2026-09-01",
        paymentMethod: "NET_BANKING",
        tags: ["payroll"],
      });

    expect(response.status).toBe(201);
    expect(response.body.income).toMatchObject({
      amount: "50000.00",
      source: "Acme Corp",
      accountId: bankId,
      categoryId: salaryId,
    });

    const account = await request(app)
      .get(`/api/v1/accounts/${bankId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(account.body.account.currentBalance).toBe("51000.00");
  });

  it("rejects expense categories", async () => {
    const token = await register("inc-expense-cat@example.com");
    const { bankId, foodId } = await fixtures(token);

    const response = await request(app)
      .post("/api/v1/incomes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "100.00",
        accountId: bankId,
        categoryId: foodId,
        transactionDate: "2026-09-01",
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("replays idempotent creates", async () => {
    const token = await register("inc-idem@example.com");
    const { bankId, salaryId } = await fixtures(token);
    const payload = {
      amount: "1000.00",
      accountId: bankId,
      categoryId: salaryId,
      transactionDate: "2026-09-05",
    };

    const first = await request(app)
      .post("/api/v1/incomes")
      .set("Authorization", `Bearer ${token}`)
      .set("Idempotency-Key", "salary-sep")
      .send(payload);
    expect(first.status).toBe(201);

    const replay = await request(app)
      .post("/api/v1/incomes")
      .set("Authorization", `Bearer ${token}`)
      .set("Idempotency-Key", "salary-sep")
      .send(payload);
    expect(replay.status).toBe(201);
    expect(replay.body.income.id).toBe(first.body.income.id);

    const account = await request(app)
      .get(`/api/v1/accounts/${bankId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(account.body.account.currentBalance).toBe("2000.00");
  });
});

describe("PATCH and archive incomes", () => {
  it("updates amount across accounts and archives with balance reverse", async () => {
    const token = await register("inc-patch@example.com");
    const { bankId, cashId, salaryId } = await fixtures(token);

    const created = await request(app)
      .post("/api/v1/incomes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "200.00",
        accountId: bankId,
        categoryId: salaryId,
        transactionDate: "2026-09-10",
      });

    const updated = await request(app)
      .patch(`/api/v1/incomes/${created.body.income.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: "150.00", accountId: cashId });

    expect(updated.status).toBe(200);
    expect(updated.body.income).toMatchObject({
      amount: "150.00",
      accountId: cashId,
    });

    let bank = await request(app)
      .get(`/api/v1/accounts/${bankId}`)
      .set("Authorization", `Bearer ${token}`);
    let cash = await request(app)
      .get(`/api/v1/accounts/${cashId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(bank.body.account.currentBalance).toBe("1000.00");
    expect(cash.body.account.currentBalance).toBe("150.00");

    const archived = await request(app)
      .post(`/api/v1/incomes/${created.body.income.id}/archive`)
      .set("Authorization", `Bearer ${token}`);
    expect(archived.status).toBe(200);
    expect(archived.body.income.archivedAt).toBeTruthy();

    cash = await request(app)
      .get(`/api/v1/accounts/${cashId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(cash.body.account.currentBalance).toBe("0.00");

    const restored = await request(app)
      .post(`/api/v1/incomes/${created.body.income.id}/unarchive`)
      .set("Authorization", `Bearer ${token}`);
    expect(restored.status).toBe(200);
    expect(restored.body.income.archivedAt).toBeNull();

    cash = await request(app)
      .get(`/api/v1/accounts/${cashId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(cash.body.account.currentBalance).toBe("150.00");
  });
});

describe("GET /api/v1/incomes", () => {
  it("lists with filters and hides other users", async () => {
    const tokenA = await register("inc-list-a@example.com");
    const tokenB = await register("inc-list-b@example.com");
    const fixturesA = await fixtures(tokenA);

    const created = await request(app)
      .post("/api/v1/incomes")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: "300.00",
        accountId: fixturesA.bankId,
        categoryId: fixturesA.salaryId,
        transactionDate: "2026-09-12",
      });

    const list = await request(app)
      .get("/api/v1/incomes")
      .query({ accountId: fixturesA.bankId })
      .set("Authorization", `Bearer ${tokenA}`);
    expect(list.status).toBe(200);
    expect(list.body.incomes).toHaveLength(1);

    const other = await request(app)
      .get(`/api/v1/incomes/${created.body.income.id}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(other.status).toBe(404);
  });
});
