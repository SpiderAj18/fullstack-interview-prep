import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";

const app = createApp();

async function register(email: string) {
  const response = await request(app).post("/api/v1/auth/register").send({
    email,
    password: "password123",
    name: "Transfer User",
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
    .send({ name: "HDFC", type: "BANK", openingBalance: "20000.00" });
  expect(bank.status).toBe(201);

  return {
    cashId: cash.id as string,
    bankId: bank.body.account.id as string,
  };
}

describe("POST /api/v1/transfers", () => {
  it("debits source and credits destination without changing net worth", async () => {
    const token = await register("xfer-create@example.com");
    const { bankId, cashId } = await fixtures(token);

    const response = await request(app)
      .post("/api/v1/transfers")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "10000.00",
        fromAccountId: bankId,
        toAccountId: cashId,
        description: "ATM cash",
        transactionDate: "2026-09-23",
      });

    expect(response.status).toBe(201);
    expect(response.body.transfer).toMatchObject({
      amount: "10000.00",
      fromAccountId: bankId,
      toAccountId: cashId,
    });

    const bank = await request(app)
      .get(`/api/v1/accounts/${bankId}`)
      .set("Authorization", `Bearer ${token}`);
    const cash = await request(app)
      .get(`/api/v1/accounts/${cashId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(bank.body.account.currentBalance).toBe("10000.00");
    expect(cash.body.account.currentBalance).toBe("10000.00");
  });

  it("rejects same from and to account", async () => {
    const token = await register("xfer-same@example.com");
    const { bankId } = await fixtures(token);

    const response = await request(app)
      .post("/api/v1/transfers")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "50.00",
        fromAccountId: bankId,
        toAccountId: bankId,
        transactionDate: "2026-09-23",
      });

    expect(response.status).toBe(400);
  });

  it("replays idempotent creates", async () => {
    const token = await register("xfer-idem@example.com");
    const { bankId, cashId } = await fixtures(token);
    const payload = {
      amount: "500.00",
      fromAccountId: bankId,
      toAccountId: cashId,
      transactionDate: "2026-09-20",
    };

    const first = await request(app)
      .post("/api/v1/transfers")
      .set("Authorization", `Bearer ${token}`)
      .set("Idempotency-Key", "xfer-1")
      .send(payload);
    expect(first.status).toBe(201);

    const replay = await request(app)
      .post("/api/v1/transfers")
      .set("Authorization", `Bearer ${token}`)
      .set("Idempotency-Key", "xfer-1")
      .send(payload);
    expect(replay.status).toBe(201);
    expect(replay.body.transfer.id).toBe(first.body.transfer.id);

    const bank = await request(app)
      .get(`/api/v1/accounts/${bankId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(bank.body.account.currentBalance).toBe("19500.00");
  });
});

describe("PATCH and archive transfers", () => {
  it("updates amount and archives with full reverse", async () => {
    const token = await register("xfer-patch@example.com");
    const { bankId, cashId } = await fixtures(token);

    const created = await request(app)
      .post("/api/v1/transfers")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "1000.00",
        fromAccountId: bankId,
        toAccountId: cashId,
        transactionDate: "2026-09-15",
      });

    const updated = await request(app)
      .patch(`/api/v1/transfers/${created.body.transfer.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: "2500.00" });

    expect(updated.status).toBe(200);
    expect(updated.body.transfer.amount).toBe("2500.00");

    let bank = await request(app)
      .get(`/api/v1/accounts/${bankId}`)
      .set("Authorization", `Bearer ${token}`);
    let cash = await request(app)
      .get(`/api/v1/accounts/${cashId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(bank.body.account.currentBalance).toBe("17500.00");
    expect(cash.body.account.currentBalance).toBe("2500.00");

    const archived = await request(app)
      .post(`/api/v1/transfers/${created.body.transfer.id}/archive`)
      .set("Authorization", `Bearer ${token}`);
    expect(archived.status).toBe(200);
    expect(archived.body.transfer.archivedAt).toBeTruthy();

    bank = await request(app)
      .get(`/api/v1/accounts/${bankId}`)
      .set("Authorization", `Bearer ${token}`);
    cash = await request(app)
      .get(`/api/v1/accounts/${cashId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(bank.body.account.currentBalance).toBe("20000.00");
    expect(cash.body.account.currentBalance).toBe("0.00");
  });
});

describe("GET /api/v1/transfers", () => {
  it("filters by account involvement and hides other users", async () => {
    const tokenA = await register("xfer-list-a@example.com");
    const tokenB = await register("xfer-list-b@example.com");
    const fixturesA = await fixtures(tokenA);

    const created = await request(app)
      .post("/api/v1/transfers")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        amount: "100.00",
        fromAccountId: fixturesA.bankId,
        toAccountId: fixturesA.cashId,
        transactionDate: "2026-09-12",
      });

    const list = await request(app)
      .get("/api/v1/transfers")
      .query({ accountId: fixturesA.cashId })
      .set("Authorization", `Bearer ${tokenA}`);
    expect(list.status).toBe(200);
    expect(list.body.transfers).toHaveLength(1);

    const other = await request(app)
      .get(`/api/v1/transfers/${created.body.transfer.id}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(other.status).toBe(404);
  });
});
