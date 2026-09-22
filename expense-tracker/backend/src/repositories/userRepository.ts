import { User } from "@prisma/client";
import { prisma } from "../config/database";

export type CreateUserInput = {
  email: string;
  passwordHash: string;
  name?: string;
};

export type UpdateProfileInput = {
  name: string | null;
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

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async updateProfile(id: string, input: UpdateProfileInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        name: input.name,
      },
    });
  },

  async updatePasswordHash(id: string, passwordHash: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        passwordHash,
      },
    });
  },
};
