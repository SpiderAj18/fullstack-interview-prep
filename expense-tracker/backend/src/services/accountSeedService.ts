import { Prisma } from "@prisma/client";
import { accountRepository } from "../repositories/accountRepository";

export const DEFAULT_CASH_ACCOUNT = {
  name: "Cash",
  type: "CASH" as const,
  currency: "INR",
  openingBalance: 0,
  currentBalance: 0,
  sortOrder: 0,
  isSystem: true,
};

export const accountSeedService = {
  async seedDefaultsForUser(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await accountRepository.create(
      {
        userId,
        name: DEFAULT_CASH_ACCOUNT.name,
        type: DEFAULT_CASH_ACCOUNT.type,
        currency: DEFAULT_CASH_ACCOUNT.currency,
        openingBalance: DEFAULT_CASH_ACCOUNT.openingBalance,
        currentBalance: DEFAULT_CASH_ACCOUNT.currentBalance,
        sortOrder: DEFAULT_CASH_ACCOUNT.sortOrder,
        isSystem: DEFAULT_CASH_ACCOUNT.isSystem,
      },
      tx,
    );
  },

  async seedDefaultsIfEmpty(userId: string): Promise<boolean> {
    const count = await accountRepository.countByUserId(userId);
    if (count > 0) {
      return false;
    }

    await accountSeedService.seedDefaultsForUser(userId);
    return true;
  },
};
