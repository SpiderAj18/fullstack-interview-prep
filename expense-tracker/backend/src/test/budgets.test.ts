import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";

const app = createApp();

async function register(email: string) {
  const response = await request(app).post("/api/v1/auth/register").send({
    email,
    password: "password123",
    name: "Budget User",
  });
  expect(response.status).toBe(201);
  return response.body.accessToken as string;
}

async function fixtures(token: string) {
  const accounts = await request(app)
    .get("/api/v1/accounts")
    .set("Authorization", `Bearer ${token}`);
  const cashId = accounts.body.accounts[0].id as string;

  const categories = await request(app)
    .get("/api/v1/categories")
    .query({ type: "EXPENSE" })
    .set("Authorization", `Bearer ${token}`);
  const food = categories.body.categories.find(
    (category: { name: string }) => category.name === "Food",
  );
  const transport = categories.body.categories.find(
    (category: { name: string }) => category.name === "Transport",
  );

  return {
    cashId,
    foodId: food.id as string,
    groceryId: food.children.find(
      (child: { name: string }) => child.name === "Grocery",
    ).id as string,
    transportId: transport.id as string,
  };
}

describe("POST /api/v1/budgets", () => {
  it("creates a monthly budget with category limits", async () => {
    const token = await register("budget-create@example.com");
    const { foodId, transportId } = await fixtures(token);

    const response = await request(app)
      .post("/api/v1/budgets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        year: 2026,
        month: 9,
        totalLimit: "45000.00",
        categories: [
          { categoryId: foodId, limitAmount: "8000.00" },
          { categoryId: transportId, limitAmount: "5000.00" },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.budget).toMatchObject({
      year: 2026,
      month: 9,
      totalLimit: "45000.00",
      warningThreshold: 80,
      criticalThreshold: 90,
      utilization: {
        spent: "0.00",
        remaining: "45000.00",
        percentageUsed: "0.00",
        status: "SAFE",
      },
    });
    expect(response.body.budget.categories).toHaveLength(2);
  });

  it("rejects category limits that exceed total", async () => {
    const token = await register("budget-sum@example.com");
    const { foodId, transportId } = await fixtures(token);

    const response = await request(app)
      .post("/api/v1/budgets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        year: 2026,
        month: 9,
        totalLimit: "10000.00",
        categories: [
          { categoryId: foodId, limitAmount: "8000.00" },
          { categoryId: transportId, limitAmount: "5000.00" },
        ],
      });

    expect(response.status).toBe(400);
  });
});

describe("budget utilization and alerts", () => {
  it("computes utilization including child category spend and emits alerts", async () => {
    const token = await register("budget-util@example.com");
    const { cashId, foodId, groceryId } = await fixtures(token);

    const budget = await request(app)
      .post("/api/v1/budgets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        year: 2026,
        month: 9,
        totalLimit: "1000.00",
        warningThreshold: 50,
        criticalThreshold: 80,
        categories: [{ categoryId: foodId, limitAmount: "500.00" }],
      });
    expect(budget.status).toBe(201);

    await request(app)
      .post("/api/v1/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "400.00",
        accountId: cashId,
        categoryId: groceryId,
        transactionDate: "2026-09-10",
        merchant: "BigBasket",
      });

    const detail = await request(app)
      .get(`/api/v1/budgets/${budget.body.budget.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(detail.status).toBe(200);
    expect(detail.body.budget.utilization).toMatchObject({
      spent: "400.00",
      percentageUsed: "40.00",
      status: "SAFE",
    });
    expect(detail.body.budget.categories[0].utilization).toMatchObject({
      spent: "400.00",
      percentageUsed: "80.00",
      status: "CRITICAL",
    });

    const alerts = await request(app)
      .get(`/api/v1/budgets/${budget.body.budget.id}/alerts`)
      .set("Authorization", `Bearer ${token}`);

    expect(alerts.status).toBe(200);
    expect(alerts.body.alerts.length).toBeGreaterThan(0);
    expect(
      alerts.body.alerts.some(
        (alert: { status: string; scope: string }) =>
          alert.status === "CRITICAL" && alert.scope.startsWith("CATEGORY:"),
      ),
    ).toBe(true);

    const alertId = alerts.body.alerts[0].id as string;
    const acknowledged = await request(app)
      .post(`/api/v1/budgets/${budget.body.budget.id}/alerts/${alertId}/acknowledge`)
      .set("Authorization", `Bearer ${token}`);
    expect(acknowledged.status).toBe(200);
    expect(acknowledged.body.alert.acknowledgedAt).toBeTruthy();
  });

  it("marks total budget EXCEEDED at 100%", async () => {
    const token = await register("budget-exceeded@example.com");
    const { cashId, foodId } = await fixtures(token);

    const budget = await request(app)
      .post("/api/v1/budgets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        year: 2026,
        month: 9,
        totalLimit: "100.00",
        categories: [{ categoryId: foodId, limitAmount: "100.00" }],
      });

    await request(app)
      .post("/api/v1/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "120.00",
        accountId: cashId,
        categoryId: foodId,
        transactionDate: "2026-09-12",
      });

    const detail = await request(app)
      .get(`/api/v1/budgets/${budget.body.budget.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(detail.body.budget.utilization.status).toBe("EXCEEDED");
    expect(detail.body.budget.utilization.percentageUsed).toBe("120.00");
  });
});

describe("GET /api/v1/budgets", () => {
  it("lists budgets for a month and rejects unauthenticated access", async () => {
    const token = await register("budget-list@example.com");
    const { foodId } = await fixtures(token);

    await request(app)
      .post("/api/v1/budgets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        year: 2026,
        month: 9,
        totalLimit: "20000.00",
        categories: [{ categoryId: foodId, limitAmount: "5000.00" }],
      });

    const list = await request(app)
      .get("/api/v1/budgets")
      .query({ year: 2026, month: 9 })
      .set("Authorization", `Bearer ${token}`);

    expect(list.status).toBe(200);
    expect(list.body.budgets).toHaveLength(1);

    const unauth = await request(app).get("/api/v1/budgets");
    expect(unauth.status).toBe(401);
  });
});
