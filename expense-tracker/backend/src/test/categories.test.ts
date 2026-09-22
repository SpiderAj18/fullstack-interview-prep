import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { prisma } from "../config/database";

const app = createApp();

async function register(email: string) {
  const response = await request(app).post("/api/v1/auth/register").send({
    email,
    password: "password123",
    name: "Category User",
  });
  expect(response.status).toBe(201);
  return response.body.accessToken as string;
}

describe("GET /api/v1/categories", () => {
  it("returns seeded expense and income category trees after register", async () => {
    const token = await register("cats-list@example.com");

    const response = await request(app)
      .get("/api/v1/categories")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.categories.length).toBeGreaterThan(0);

    const food = response.body.categories.find(
      (category: { name: string }) => category.name === "Food",
    );
    expect(food).toMatchObject({ type: "EXPENSE", isSystem: true });
    expect(food.children.map((child: { name: string }) => child.name)).toEqual(
      expect.arrayContaining(["Grocery", "Restaurant"]),
    );

    const salary = response.body.categories.find(
      (category: { name: string }) => category.name === "Salary",
    );
    expect(salary).toMatchObject({ type: "INCOME", isSystem: true });
  });

  it("filters by type", async () => {
    const token = await register("cats-filter@example.com");

    const response = await request(app)
      .get("/api/v1/categories")
      .query({ type: "INCOME" })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(
      response.body.categories.every(
        (category: { type: string }) => category.type === "INCOME",
      ),
    ).toBe(true);
  });

  it("rejects unauthenticated access", async () => {
    const response = await request(app).get("/api/v1/categories");
    expect(response.status).toBe(401);
  });
});

describe("POST /api/v1/categories", () => {
  it("creates a custom subcategory under a parent", async () => {
    const token = await register("cats-create@example.com");

    const list = await request(app)
      .get("/api/v1/categories")
      .query({ type: "EXPENSE" })
      .set("Authorization", `Bearer ${token}`);

    const food = list.body.categories.find(
      (category: { name: string }) => category.name === "Food",
    );

    const response = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Coffee",
        type: "EXPENSE",
        parentId: food.id,
        color: "#7C2D12",
      });

    expect(response.status).toBe(201);
    expect(response.body.category).toMatchObject({
      name: "Coffee",
      type: "EXPENSE",
      parentId: food.id,
      isSystem: false,
    });
  });

  it("rejects nesting deeper than one level", async () => {
    const token = await register("cats-depth@example.com");

    const list = await request(app)
      .get("/api/v1/categories")
      .query({ type: "EXPENSE" })
      .set("Authorization", `Bearer ${token}`);

    const grocery = list.body.categories
      .find((category: { name: string }) => category.name === "Food")
      .children.find((child: { name: string }) => child.name === "Grocery");

    const response = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Organic",
        type: "EXPENSE",
        parentId: grocery.id,
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects duplicate sibling names", async () => {
    const token = await register("cats-dup@example.com");

    const first = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Pets", type: "EXPENSE" });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Pets", type: "EXPENSE" });

    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe("CONFLICT");
  });
});

describe("PATCH /api/v1/categories/:id", () => {
  it("updates category name and color", async () => {
    const token = await register("cats-patch@example.com");

    const created = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Gadgets", type: "EXPENSE", color: "#111111" });

    const response = await request(app)
      .patch(`/api/v1/categories/${created.body.category.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Electronics", color: "#222222" });

    expect(response.status).toBe(200);
    expect(response.body.category).toMatchObject({
      name: "Electronics",
      color: "#222222",
    });
  });
});

describe("archive / unarchive", () => {
  it("archives a leaf category and supports unarchive", async () => {
    const token = await register("cats-archive@example.com");

    const created = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Books", type: "EXPENSE" });

    const archived = await request(app)
      .post(`/api/v1/categories/${created.body.category.id}/archive`)
      .set("Authorization", `Bearer ${token}`);

    expect(archived.status).toBe(200);
    expect(archived.body.category.archivedAt).toEqual(expect.any(String));

    const activeList = await request(app)
      .get("/api/v1/categories")
      .query({ type: "EXPENSE" })
      .set("Authorization", `Bearer ${token}`);

    expect(
      activeList.body.categories.some(
        (category: { name: string }) => category.name === "Books",
      ),
    ).toBe(false);

    const restored = await request(app)
      .post(`/api/v1/categories/${created.body.category.id}/unarchive`)
      .set("Authorization", `Bearer ${token}`);

    expect(restored.status).toBe(200);
    expect(restored.body.category.archivedAt).toBeNull();
  });

  it("rejects archiving a parent with active children", async () => {
    const token = await register("cats-archive-parent@example.com");

    const list = await request(app)
      .get("/api/v1/categories")
      .query({ type: "EXPENSE" })
      .set("Authorization", `Bearer ${token}`);

    const food = list.body.categories.find(
      (category: { name: string }) => category.name === "Food",
    );

    const response = await request(app)
      .post(`/api/v1/categories/${food.id}/archive`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("CONFLICT");
  });
});

describe("ownership", () => {
  it("does not allow updating another user's category", async () => {
    const tokenA = await register("cats-owner-a@example.com");
    const tokenB = await register("cats-owner-b@example.com");

    const created = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Private", type: "EXPENSE" });

    const response = await request(app)
      .patch(`/api/v1/categories/${created.body.category.id}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ name: "Hijacked" });

    expect(response.status).toBe(404);
  });
});

describe("existing user backfill", () => {
  it("seeds defaults when an existing user has no categories", async () => {
    const token = await register("cats-backfill@example.com");

    const user = await prisma.user.findUniqueOrThrow({
      where: { email: "cats-backfill@example.com" },
    });
    await prisma.category.deleteMany({ where: { userId: user.id } });

    const response = await request(app)
      .get("/api/v1/categories")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.categories.length).toBeGreaterThan(0);
  });
});
