import { Prisma } from "@prisma/client";
import { signAccessToken } from "../middleware/auth";
import { refreshSessionRepository } from "../repositories/refreshSessionRepository";
import { userRepository } from "../repositories/userRepository";
import { prisma } from "../config/database";
import { ConflictError, UnauthorizedError } from "../utils/errors";
import { comparePassword, DUMMY_PASSWORD_HASH, hashPassword } from "../utils/password";
import type { LoginBody, RegisterBody } from "../validators/authSchemas";
import { accountSeedService } from "./accountSeedService";
import { categorySeedService } from "./categorySeedService";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
};

export type AuthResult = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

function toPublicUser(user: {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}

async function issueAuthResult(user: {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}): Promise<AuthResult> {
  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
  });
  const { refreshToken } = await refreshSessionRepository.create({
    userId: user.id,
    email: user.email,
  });

  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken,
  };
}

export const authService = {
  async register(input: RegisterBody): Promise<AuthResult> {
    const email = input.email.toLowerCase();
    const passwordHash = await hashPassword(input.password);

    try {
      const user = await prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: {
            email,
            passwordHash,
            name: input.name,
          },
        });

        await categorySeedService.seedDefaultsForUser(created.id, tx);
        await accountSeedService.seedDefaultsForUser(created.id, tx);
        return created;
      });

      return issueAuthResult(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictError("Email already registered");
      }

      throw error;
    }
  },

  async login(input: LoginBody): Promise<AuthResult> {
    const email = input.email.toLowerCase();
    const user = await userRepository.findByEmail(email);

    const passwordMatches = await comparePassword(
      input.password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );

    if (!user || !passwordMatches) {
      throw new UnauthorizedError("Invalid email or password");
    }

    await categorySeedService.seedDefaultsIfEmpty(user.id);
    await accountSeedService.seedDefaultsIfEmpty(user.id);

    return issueAuthResult(user);
  },

  async refresh(refreshToken: string): Promise<TokenPair> {
    const rotated = await refreshSessionRepository.rotate(refreshToken);

    return {
      accessToken: signAccessToken({
        userId: rotated.session.userId,
        email: rotated.session.email,
      }),
      refreshToken: rotated.refreshToken,
    };
  },

  async logout(refreshToken: string): Promise<void> {
    await refreshSessionRepository.revokeByToken(refreshToken);
  },
};
