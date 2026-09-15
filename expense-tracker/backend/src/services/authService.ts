import { Prisma } from "@prisma/client";
import { signAccessToken } from "../middleware/auth";
import { userRepository } from "../repositories/userRepository";
import { ConflictError } from "../utils/errors";
import { hashPassword } from "../utils/password";
import type { RegisterBody } from "../validators/authSchemas";

export type RegisteredUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
};

export type RegisterResult = {
  user: RegisteredUser;
  accessToken: string;
};

function toPublicUser(user: {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}): RegisteredUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}

export const authService = {
  async register(input: RegisterBody): Promise<RegisterResult> {
    const email = input.email.toLowerCase();
    const passwordHash = await hashPassword(input.password);

    try {
      const user = await userRepository.create({
        email,
        passwordHash,
        name: input.name,
      });

      const accessToken = signAccessToken({
        userId: user.id,
        email: user.email,
      });

      return {
        user: toPublicUser(user),
        accessToken,
      };
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
};
