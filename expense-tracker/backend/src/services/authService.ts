import { Prisma } from "@prisma/client";
import { signAccessToken } from "../middleware/auth";
import { userRepository } from "../repositories/userRepository";
import { ConflictError, UnauthorizedError } from "../utils/errors";
import { comparePassword, DUMMY_PASSWORD_HASH, hashPassword } from "../utils/password";
import type { LoginBody, RegisterBody } from "../validators/authSchemas";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
};

export type AuthResult = {
  user: AuthUser;
  accessToken: string;
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

function buildAuthResult(user: {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}): AuthResult {
  return {
    user: toPublicUser(user),
    accessToken: signAccessToken({
      userId: user.id,
      email: user.email,
    }),
  };
}

export const authService = {
  async register(input: RegisterBody): Promise<AuthResult> {
    const email = input.email.toLowerCase();
    const passwordHash = await hashPassword(input.password);

    try {
      const user = await userRepository.create({
        email,
        passwordHash,
        name: input.name,
      });

      return buildAuthResult(user);
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

    return buildAuthResult(user);
  },
};
