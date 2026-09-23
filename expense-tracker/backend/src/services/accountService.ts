import { Account, AccountType, Prisma } from "@prisma/client";
import { accountRepository } from "../repositories/accountRepository";
import { ConflictError, NotFoundError } from "../utils/errors";
import type {
  CreateAccountBody,
  ListAccountsQuery,
  UpdateAccountBody,
} from "../validators/accountSchemas";
import { accountSeedService } from "./accountSeedService";

export type PublicAccount = {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  color: string | null;
  icon: string | null;
  sortOrder: number;
  openingBalance: string;
  currentBalance: string;
  isSystem: boolean;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function formatMoney(value: Prisma.Decimal | string | number): string {
  return new Prisma.Decimal(value).toFixed(2);
}

function toPublicAccount(account: Account): PublicAccount {
  return {
    id: account.id,
    name: account.name,
    type: account.type,
    currency: account.currency,
    color: account.color,
    icon: account.icon,
    sortOrder: account.sortOrder,
    openingBalance: formatMoney(account.openingBalance),
    currentBalance: formatMoney(account.currentBalance),
    isSystem: account.isSystem,
    archivedAt: account.archivedAt,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

async function requireOwnedAccount(id: string, userId: string): Promise<Account> {
  const account = await accountRepository.findByIdForUser(id, userId);
  if (!account) {
    throw new NotFoundError("Account not found");
  }
  return account;
}

async function assertUniqueName(
  userId: string,
  name: string,
  excludeId?: string,
): Promise<void> {
  const existing = await accountRepository.findByNameForUser(userId, name);
  if (existing && existing.id !== excludeId) {
    throw new ConflictError("An account with this name already exists");
  }
}

export const accountService = {
  async list(userId: string, query: ListAccountsQuery): Promise<PublicAccount[]> {
    await accountSeedService.seedDefaultsIfEmpty(userId);

    const accounts = await accountRepository.findManyForUser({
      userId,
      type: query.type,
      includeArchived: query.includeArchived ?? false,
    });

    return accounts.map(toPublicAccount);
  },

  async getById(userId: string, accountId: string): Promise<PublicAccount> {
    const account = await requireOwnedAccount(accountId, userId);
    return toPublicAccount(account);
  },

  async create(userId: string, input: CreateAccountBody): Promise<PublicAccount> {
    await assertUniqueName(userId, input.name);

    const openingBalance = input.openingBalance;
    const created = await accountRepository.create({
      userId,
      name: input.name,
      type: input.type,
      currency: input.currency,
      color: input.color,
      icon: input.icon,
      sortOrder: input.sortOrder,
      openingBalance,
      currentBalance: openingBalance,
      isSystem: false,
    });

    return toPublicAccount(created);
  },

  async update(
    userId: string,
    accountId: string,
    input: UpdateAccountBody,
  ): Promise<PublicAccount> {
    const account = await requireOwnedAccount(accountId, userId);

    if (input.name && input.name !== account.name) {
      await assertUniqueName(userId, input.name, account.id);
    }

    const updated = await accountRepository.update(account.id, {
      name: input.name,
      color: input.color,
      icon: input.icon,
      sortOrder: input.sortOrder,
    });

    return toPublicAccount(updated);
  },

  async archive(userId: string, accountId: string): Promise<PublicAccount> {
    const account = await requireOwnedAccount(accountId, userId);

    if (account.archivedAt) {
      return toPublicAccount(account);
    }

    const activeCount = await accountRepository.countActiveByUserId(userId);
    if (activeCount <= 1) {
      throw new ConflictError("Cannot archive the last active account");
    }

    const archived = await accountRepository.archive(account.id);
    return toPublicAccount(archived);
  },

  async unarchive(userId: string, accountId: string): Promise<PublicAccount> {
    const account = await requireOwnedAccount(accountId, userId);

    if (!account.archivedAt) {
      return toPublicAccount(account);
    }

    const restored = await accountRepository.unarchive(account.id);
    return toPublicAccount(restored);
  },
};
