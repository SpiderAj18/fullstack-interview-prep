import { User } from "@prisma/client";
import { prisma } from "../config/database";

export type CreateUserInput = {
  email: string;
  passwordHash: string;
  name?: string;
};

export const userRepository = {
  async create(input: CreateUserInput): Promise<User> {
    return prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        name: input.name,
      },
    });
  },

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  },
};
