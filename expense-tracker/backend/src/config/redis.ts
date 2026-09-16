import { createClient } from "redis";
import { env } from "./env";

export const redis = createClient({
  url: env.REDIS_URL,
});

redis.on("error", (error) => {
  console.error(
    JSON.stringify({
      message: "Redis client error",
      error: error instanceof Error ? error.message : String(error),
    }),
  );
});

export async function connectRedis(): Promise<void> {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redis.isOpen) {
    await redis.quit();
  }
}
