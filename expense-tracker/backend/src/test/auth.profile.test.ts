import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";

const app = createApp();

async function registerAndLogin(email: string) {
  const registered = await request(app).post("/api/v1/auth/register").send({
    email,
    password: "password123",
    name: "Jane",
  });

  expect(registered.status).toBe(201);

  return {
    accessToken: registered.body.accessToken as string,
    refreshToken: registered.body.refreshToken as string,
    user: registered.body.user,
  };
}

describe("GET /api/v1/auth/me", () => {
  it("returns the authenticated user profile", async () => {
    const session = await registerAndLogin("profile-get@example.com");

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${session.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({
      id: session.user.id,
      email: "profile-get@example.com",
      name: "Jane",
    });
    expect(response.body.user.updatedAt).toEqual(expect.any(String));
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  it("rejects missing access token", async () => {
    const response = await request(app).get("/api/v1/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });
});

describe("PATCH /api/v1/auth/me", () => {
  it("updates the user name", async () => {
    const session = await registerAndLogin("profile-patch@example.com");

    const response = await request(app)
      .patch("/api/v1/auth/me")
      .set("Authorization", `Bearer ${session.accessToken}`)
      .send({ name: "Jane Doe" });

    expect(response.status).toBe(200);
    expect(response.body.user.name).toBe("Jane Doe");
  });

  it("clears name when empty string is sent", async () => {
    const session = await registerAndLogin("profile-clear@example.com");

    const response = await request(app)
      .patch("/api/v1/auth/me")
      .set("Authorization", `Bearer ${session.accessToken}`)
      .send({ name: "   " });

    expect(response.status).toBe(200);
    expect(response.body.user.name).toBeNull();
  });

  it("rejects unauthorized updates", async () => {
    const response = await request(app).patch("/api/v1/auth/me").send({ name: "Nope" });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });
});

describe("POST /api/v1/auth/change-password", () => {
  it("changes password, revokes refresh sessions, and requires new credentials", async () => {
    const session = await registerAndLogin("profile-password@example.com");

    const change = await request(app)
      .post("/api/v1/auth/change-password")
      .set("Authorization", `Bearer ${session.accessToken}`)
      .send({
        currentPassword: "password123",
        newPassword: "newpassword1",
      });

    expect(change.status).toBe(204);

    const refreshAfter = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: session.refreshToken,
    });
    expect(refreshAfter.status).toBe(401);

    const oldLogin = await request(app).post("/api/v1/auth/login").send({
      email: "profile-password@example.com",
      password: "password123",
    });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app).post("/api/v1/auth/login").send({
      email: "profile-password@example.com",
      password: "newpassword1",
    });
    expect(newLogin.status).toBe(200);
    expect(newLogin.body.refreshToken).toEqual(expect.any(String));
  });

  it("rejects wrong current password", async () => {
    const session = await registerAndLogin("profile-bad-current@example.com");

    const response = await request(app)
      .post("/api/v1/auth/change-password")
      .set("Authorization", `Bearer ${session.accessToken}`)
      .send({
        currentPassword: "wrongpass1",
        newPassword: "newpassword1",
      });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects when new password matches current", async () => {
    const session = await registerAndLogin("profile-same-password@example.com");

    const response = await request(app)
      .post("/api/v1/auth/change-password")
      .set("Authorization", `Bearer ${session.accessToken}`)
      .send({
        currentPassword: "password123",
        newPassword: "password123",
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
