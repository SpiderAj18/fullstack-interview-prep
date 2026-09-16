import jwt from "jsonwebtoken";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { env } from "../config/env";

const app = createApp();

async function registerUser(email = "refresh@example.com") {
  return request(app).post("/api/v1/auth/register").send({
    email,
    password: "password123",
    name: "Refresh User",
  });
}

describe("POST /api/v1/auth/refresh", () => {
  it("rotates tokens and rejects the previous refresh token", async () => {
    const registered = await registerUser();
    expect(registered.status).toBe(201);

    const firstRefresh = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: registered.body.refreshToken,
    });

    expect(firstRefresh.status).toBe(200);
    expect(firstRefresh.body.accessToken).toEqual(expect.any(String));
    expect(firstRefresh.body.refreshToken).toEqual(expect.any(String));
    expect(firstRefresh.body.refreshToken).not.toBe(registered.body.refreshToken);

    const payload = jwt.verify(firstRefresh.body.accessToken, env.JWT_SECRET) as {
      userId: string;
      email: string;
    };
    expect(payload.userId).toBe(registered.body.user.id);
    expect(payload.email).toBe("refresh@example.com");

    const reuseOld = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: registered.body.refreshToken,
    });

    expect(reuseOld.status).toBe(401);
    expect(reuseOld.body.error.code).toBe("UNAUTHORIZED");

    const reuseRotated = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: firstRefresh.body.refreshToken,
    });

    expect(reuseRotated.status).toBe(401);
    expect(reuseRotated.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects invalid refresh tokens", async () => {
    const response = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: "not-a-real-token",
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects missing refresh token", async () => {
    const response = await request(app).post("/api/v1/auth/refresh").send({});

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("POST /api/v1/auth/logout", () => {
  it("revokes the refresh session", async () => {
    const registered = await registerUser("logout@example.com");
    expect(registered.status).toBe(201);

    const logout = await request(app).post("/api/v1/auth/logout").send({
      refreshToken: registered.body.refreshToken,
    });

    expect(logout.status).toBe(204);

    const refreshAfterLogout = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: registered.body.refreshToken,
    });

    expect(refreshAfterLogout.status).toBe(401);
    expect(refreshAfterLogout.body.error.code).toBe("UNAUTHORIZED");
  });

  it("is idempotent for unknown refresh tokens", async () => {
    const response = await request(app).post("/api/v1/auth/logout").send({
      refreshToken: "already-gone-token",
    });

    expect(response.status).toBe(204);
  });
});
