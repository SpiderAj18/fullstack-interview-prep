import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";

const app = createApp();

async function register(email: string) {
  const response = await request(app).post("/api/v1/auth/register").send({
    email,
    password: "password123",
    name: "Account User",
  });
  expect(response.status).toBe(201);
  return response.body.accessToken as string;
}

describe("GET /api/v1/accounts", () => {
  it("returns seeded Cash account after register", async () => {
    const token = await register("accounts-list@example.com");

    const response = await request(app)
      .get("/api/v1/accounts")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.accounts).toHaveLength(1);
    expect(response.body.accounts[0]).toMatchObject({
      name: "Cash",
      type: "CASH",
      currency: "INR",
      openingBalance: "0.00",
      currentBalance: "0.00",
      isSystem: true,
    });
  });

  it("filters by type", async () => {
    const token = await register("accounts-filter@example.com");

    await request(app)
      .post("/api/v1/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "HDFC", type: "BANK", openingBalance: "1000.00" });

    const response = await request(app)
      .get("/api/v1/accounts")
      .query({ type: "BANK" })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.accounts).toHaveLength(1);
    expect(response.body.accounts[0].type).toBe("BANK");
  });

  it("rejects unauthenticated access", async () => {
    const response = await request(app).get("/api/v1/accounts");
    expect(response.status).toBe(401);
  });
});

describe("GET /api/v1/accounts/:id", () => {
  it("returns account detail with balances", async () => {
    const token = await register("accounts-get@example.com");

    const list = await request(app)
      .get("/api/v1/accounts")
      .set("Authorization", `Bearer ${token}`);

    const cashId = list.body.accounts[0].id as string;

    const response = await request(app)
      .get(`/api/v1/accounts/${cashId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.account).toMatchObject({
      id: cashId,
      name: "Cash",
      currentBalance: "0.00",
    });
  });

  it("does not return another user's account", async () => {
    const tokenA = await register("accounts-owner-a@example.com");
    const tokenB = await register("accounts-owner-b@example.com");

    const listA = await request(app)
      .get("/api/v1/accounts")
      .set("Authorization", `Bearer ${tokenA}`);

    const response = await request(app)
      .get(`/api/v1/accounts/${listA.body.accounts[0].id}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });
});

describe("POST /api/v1/accounts", () => {
  it("creates an account with opening balance copied to current", async () => {
    const token = await register("accounts-create@example.com");

    const response = await request(app)
      .post("/api/v1/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "HDFC Savings",
        type: "BANK",
        openingBalance: "15000.50",
        currency: "INR",
        color: "#1D4ED8",
      });

    expect(response.status).toBe(201);
    expect(response.body.account).toMatchObject({
      name: "HDFC Savings",
      type: "BANK",
      openingBalance: "15000.50",
      currentBalance: "15000.50",
      isSystem: false,
      color: "#1D4ED8",
    });
  });

  it("rejects duplicate account names", async () => {
    const token = await register("accounts-dup@example.com");

    const first = await request(app)
      .post("/api/v1/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Wallet", type: "WALLET" });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post("/api/v1/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Wallet", type: "WALLET" });

    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe("CONFLICT");
  });

  it("rejects invalid opening balance precision", async () => {
    const token = await register("accounts-money@example.com");

    const response = await request(app)
      .post("/api/v1/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Bad Money",
        type: "BANK",
        openingBalance: "10.999",
      });

    expect(response.status).toBe(400);
  });
});

describe("PATCH /api/v1/accounts/:id", () => {
  it("updates name and color only", async () => {
    const token = await register("accounts-patch@example.com");

    const created = await request(app)
      .post("/api/v1/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "ICICI", type: "BANK", openingBalance: "500.00" });

    const response = await request(app)
      .patch(`/api/v1/accounts/${created.body.account.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "ICICI Salary", color: "#0F766E" });

    expect(response.status).toBe(200);
    expect(response.body.account).toMatchObject({
      name: "ICICI Salary",
      color: "#0F766E",
      type: "BANK",
      currentBalance: "500.00",
    });
  });

  it("rejects currentBalance in patch body", async () => {
    const token = await register("accounts-no-balance-patch@example.com");

    const created = await request(app)
      .post("/api/v1/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "SBI", type: "BANK", openingBalance: "100.00" });

    const response = await request(app)
      .patch(`/api/v1/accounts/${created.body.account.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ currentBalance: "999.00" });

    expect(response.status).toBe(400);
  });
});

describe("archive / unarchive accounts", () => {
  it("archives and restores an account", async () => {
    const token = await register("accounts-archive@example.com");

    const created = await request(app)
      .post("/api/v1/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "UPI PhonePe", type: "UPI" });

    const archived = await request(app)
      .post(`/api/v1/accounts/${created.body.account.id}/archive`)
      .set("Authorization", `Bearer ${token}`);

    expect(archived.status).toBe(200);
    expect(archived.body.account.archivedAt).toBeTruthy();

    const listActive = await request(app)
      .get("/api/v1/accounts")
      .set("Authorization", `Bearer ${token}`);
    expect(
      listActive.body.accounts.every(
        (account: { id: string }) => account.id !== created.body.account.id,
      ),
    ).toBe(true);

    const restored = await request(app)
      .post(`/api/v1/accounts/${created.body.account.id}/unarchive`)
      .set("Authorization", `Bearer ${token}`);

    expect(restored.status).toBe(200);
    expect(restored.body.account.archivedAt).toBeNull();
  });

  it("rejects archiving the last active account", async () => {
    const token = await register("accounts-last-active@example.com");

    const list = await request(app)
      .get("/api/v1/accounts")
      .set("Authorization", `Bearer ${token}`);

    const cashId = list.body.accounts[0].id as string;

    const response = await request(app)
      .post(`/api/v1/accounts/${cashId}/archive`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("CONFLICT");
    expect(response.body.error.message).toMatch(/last active/i);
  });
});
