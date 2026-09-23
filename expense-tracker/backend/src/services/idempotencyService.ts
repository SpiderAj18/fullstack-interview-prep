import { createHash } from "crypto";
import { redis } from "../config/redis";
import { ConflictError } from "../utils/errors";

const IDEMPOTENCY_TTL_SECONDS = 60 * 60 * 24;

type StoredIdempotencyRecord = {
  requestHash: string;
  statusCode: number;
  body: unknown;
};

function idempotencyKey(userId: string, key: string): string {
  return `idempotency:${userId}:${key}`;
}

function hashRequestBody(body: unknown): string {
  return createHash("sha256").update(JSON.stringify(body)).digest("hex");
}

export const idempotencyService = {
  hashRequestBody,

  async getReplay(
    userId: string,
    key: string,
    body: unknown,
  ): Promise<{ statusCode: number; body: unknown } | null> {
    const raw = await redis.get(idempotencyKey(userId, key));
    if (!raw) {
      return null;
    }

    const stored = JSON.parse(raw) as StoredIdempotencyRecord;
    const requestHash = hashRequestBody(body);
    if (stored.requestHash !== requestHash) {
      throw new ConflictError("Idempotency key was already used with a different request");
    }

    return {
      statusCode: stored.statusCode,
      body: stored.body,
    };
  },

  async store(
    userId: string,
    key: string,
    body: unknown,
    response: { statusCode: number; body: unknown },
  ): Promise<void> {
    const record: StoredIdempotencyRecord = {
      requestHash: hashRequestBody(body),
      statusCode: response.statusCode,
      body: response.body,
    };

    await redis.set(idempotencyKey(userId, key), JSON.stringify(record), {
      EX: IDEMPOTENCY_TTL_SECONDS,
    });
  },
};
