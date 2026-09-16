import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app";
import { env } from "../config/env";

const app = createApp();

async function registerUser(overrides?: {
  email?: string;
  password?: string;
  name?: string;
}) {
  return request(app)
    .post("/api/v1/auth/register")
    .send({
      email: overrides?.email ?? "jane@example.com",
      password: overrides?.password ?? "password123",
      name: overrides?.name ?? "Jane",
    });
}

describe("POST /api/v1/auth/login", () => {
  beforeEach(async () => {
    await registerUser();
  });

  it("logs in an existing user and returns an access token", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: "jane@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({
      email: "jane@example.com",
      name: "Jane",
    });
    expect(response.body.user.id).toEqual(expect.any(String));
    expect(response.body.user.createdAt).toEqual(expect.any(String));
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.user.passwordHash).toBeUndefined();
    expect(response.body.password).toBeUndefined();

    const payload = jwt.verify(response.body.accessToken, env.JWT_SECRET) as {
      userId: string;
      email: string;
    };

    expect(payload.userId).toBe(response.body.user.id);
    expect(payload.email).toBe("jane@example.com");
  });

  it("logs in with case-insensitive email", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: "Jane@Example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe("jane@example.com");
  });

  it("rejects wrong password with generic unauthorized error", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: "jane@example.com",
      password: "wrongpass1",
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
    expect(response.body.error.message).toBe("Invalid email or password");
  });

  it("rejects unknown email with the same unauthorized error", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: "missing@example.com",
      password: "password123",
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
    expect(response.body.error.message).toBe("Invalid email or password");
  });

  it("rejects invalid email", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: "not-an-email",
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects short passwords", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: "jane@example.com",
      password: "short",
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects missing required fields", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({});

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
