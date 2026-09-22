import { createHash, randomBytes, randomUUID } from "crypto";
import { env } from "../config/env";
import { redis } from "../config/redis";
import { UnauthorizedError } from "../utils/errors";
import { parseDurationToSeconds } from "../utils/duration";

export type RefreshSessionRecord = {
  sessionId: string;
  familyId: string;
  userId: string;
  email: string;
  tokenHash: string;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function lookupKey(tokenHash: string): string {
  return `rt:lookup:${tokenHash}`;
}

function sessionKey(sessionId: string): string {
  return `rt:session:${sessionId}`;
}

function familyKey(familyId: string): string {
  return `rt:family:${familyId}`;
}

function rotatedKey(tokenHash: string): string {
  return `rt:rotated:${tokenHash}`;
}

function userSessionsKey(userId: string): string {
  return `rt:user:${userId}`;
}

function refreshTtlSeconds(): number {
  return parseDurationToSeconds(env.JWT_REFRESH_EXPIRES_IN);
}

async function readSession(sessionId: string): Promise<RefreshSessionRecord | null> {
  const raw = await redis.get(sessionKey(sessionId));
  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as RefreshSessionRecord;
}

async function writeSession(session: RefreshSessionRecord, ttlSeconds: number): Promise<void> {
  await redis.set(sessionKey(session.sessionId), JSON.stringify(session), {
    EX: ttlSeconds,
  });
}

async function deleteSession(session: RefreshSessionRecord): Promise<void> {
  await redis.del(sessionKey(session.sessionId));
  await redis.del(lookupKey(session.tokenHash));
  await redis.sRem(familyKey(session.familyId), session.sessionId);
  await redis.sRem(userSessionsKey(session.userId), session.sessionId);
}

export const refreshSessionRepository = {
  async create(input: {
    userId: string;
    email: string;
  }): Promise<{ refreshToken: string; session: RefreshSessionRecord }> {
    const ttlSeconds = refreshTtlSeconds();
    const refreshToken = randomBytes(32).toString("base64url");
    const tokenHash = hashToken(refreshToken);
    const session: RefreshSessionRecord = {
      sessionId: randomUUID(),
      familyId: randomUUID(),
      userId: input.userId,
      email: input.email,
      tokenHash,
    };

    await writeSession(session, ttlSeconds);
    await redis.set(lookupKey(tokenHash), session.sessionId, { EX: ttlSeconds });
    await redis.sAdd(familyKey(session.familyId), session.sessionId);
    await redis.expire(familyKey(session.familyId), ttlSeconds);
    await redis.sAdd(userSessionsKey(session.userId), session.sessionId);
    await redis.expire(userSessionsKey(session.userId), ttlSeconds);

    return { refreshToken, session };
  },

  async rotate(refreshToken: string): Promise<{
    refreshToken: string;
    session: RefreshSessionRecord;
  }> {
    const ttlSeconds = refreshTtlSeconds();
    const presentedHash = hashToken(refreshToken);
    const sessionId = await redis.get(lookupKey(presentedHash));

    if (!sessionId) {
      const familyId = await redis.get(rotatedKey(presentedHash));
      if (familyId) {
        await refreshSessionRepository.revokeFamily(familyId);
      }
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const session = await readSession(sessionId);
    if (!session || session.tokenHash !== presentedHash) {
      if (session) {
        await refreshSessionRepository.revokeFamily(session.familyId);
      }
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const nextRefreshToken = randomBytes(32).toString("base64url");
    const nextHash = hashToken(nextRefreshToken);

    await redis.set(rotatedKey(presentedHash), session.familyId, { EX: ttlSeconds });
    await redis.del(lookupKey(presentedHash));

    const updatedSession: RefreshSessionRecord = {
      ...session,
      tokenHash: nextHash,
    };

    await writeSession(updatedSession, ttlSeconds);
    await redis.set(lookupKey(nextHash), updatedSession.sessionId, { EX: ttlSeconds });
    await redis.expire(familyKey(updatedSession.familyId), ttlSeconds);
    await redis.expire(userSessionsKey(updatedSession.userId), ttlSeconds);

    return {
      refreshToken: nextRefreshToken,
      session: updatedSession,
    };
  },

  async revokeByToken(refreshToken: string): Promise<void> {
    const presentedHash = hashToken(refreshToken);
    const sessionId = await redis.get(lookupKey(presentedHash));

    if (!sessionId) {
      return;
    }

    const session = await readSession(sessionId);
    if (!session) {
      await redis.del(lookupKey(presentedHash));
      return;
    }

    await deleteSession(session);
  },

  async revokeFamily(familyId: string): Promise<void> {
    const sessionIds = await redis.sMembers(familyKey(familyId));

    for (const sessionId of sessionIds) {
      const session = await readSession(sessionId);
      if (session) {
        await deleteSession(session);
      } else {
        await redis.del(sessionKey(sessionId));
      }
    }

    await redis.del(familyKey(familyId));
  },

  async revokeAllForUser(userId: string): Promise<void> {
    const sessionIds = await redis.sMembers(userSessionsKey(userId));

    for (const sessionId of sessionIds) {
      const session = await readSession(sessionId);
      if (session) {
        await deleteSession(session);
      } else {
        await redis.del(sessionKey(sessionId));
      }
    }

    await redis.del(userSessionsKey(userId));
  },
};
