import { refreshSessionRepository } from "../repositories/refreshSessionRepository";
import { userRepository } from "../repositories/userRepository";
import { NotFoundError, UnauthorizedError, ValidationError } from "../utils/errors";
import { comparePassword, hashPassword } from "../utils/password";
import type { ChangePasswordBody, UpdateProfileBody } from "../validators/authSchemas";

export type ProfileUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toProfileUser(user: {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ProfileUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export const profileService = {
  async getProfile(userId: string): Promise<ProfileUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return toProfileUser(user);
  },

  async updateProfile(userId: string, input: UpdateProfileBody): Promise<ProfileUser> {
    const existing = await userRepository.findById(userId);
    if (!existing) {
      throw new NotFoundError("User not found");
    }

    const updated = await userRepository.updateProfile(userId, {
      name: input.name,
    });

    return toProfileUser(updated);
  },

  async changePassword(userId: string, input: ChangePasswordBody): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const currentMatches = await comparePassword(input.currentPassword, user.passwordHash);
    if (!currentMatches) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    if (input.currentPassword === input.newPassword) {
      throw new ValidationError("New password must be different from the current password");
    }

    const passwordHash = await hashPassword(input.newPassword);
    await userRepository.updatePasswordHash(userId, passwordHash);
    await refreshSessionRepository.revokeAllForUser(userId);
  },
};
