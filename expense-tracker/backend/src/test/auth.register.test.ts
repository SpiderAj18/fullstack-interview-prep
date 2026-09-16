import jwt from "jsonwebtoken";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { env } from "../config/env";
import { prisma } from "../config/database";
import { comparePassword } from "../utils/password";

const app = createApp();

describe("POST /api/v1/auth/register", () => {
  it("registers a user and returns an access token", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      email: "Jane@Example.com",
      password: "password123",
      name: "Jane",
    });

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({
      email: "jane@example.com",
      name: "Jane",
    });
    expect(response.body.user.id).toEqual(expect.any(String));
    expect(response.body.user.createdAt).toEqual(expect.any(String));
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).toEqual(expect.any(String));
    expect(response.body.user.passwordHash).toBeUndefined();
    expect(response.body.password).toBeUndefined();

    const stored = await prisma.user.findUniqueOrThrow({
      where: { email: "jane@example.com" },
    });

    expect(stored.passwordHash).not.toBe("password123");
    expect(await comparePassword("password123", stored.passwordHash)).toBe(true);

    const payload = jwt.verify(response.body.accessToken, env.JWT_SECRET) as {
      userId: string;
      email: string;
    };

    expect(payload.userId).toBe(stored.id);
    expect(payload.email).toBe("jane@example.com");
  });

  it("registers without an optional name", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      email: "noname@example.com",
      password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.body.user.name).toBeNull();
  });

  it("rejects invalid email", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      email: "not-an-email",
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects short passwords", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      email: "short@example.com",
      password: "short",
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects missing required fields", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({});

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects duplicate emails", async () => {
    const payload = {
      email: "dup@example.com",
      password: "password123",
    };

    const first = await request(app).post("/api/v1/auth/register").send(payload);
    expect(first.status).toBe(201);

    const second = await request(app).post("/api/v1/auth/register").send(payload);
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe("CONFLICT");
  });
});
