import { Account, Prisma, Transfer } from "@prisma/client";
import { prisma } from "../config/database";
import { accountRepository } from "../repositories/accountRepository";
import { transferRepository } from "../repositories/transferRepository";
import { NotFoundError, ValidationError } from "../utils/errors";
import type {
  CreateTransferBody,
  ListTransfersQuery,
  UpdateTransferBody,
} from "../validators/transferSchemas";

export type PublicTransfer = {
  id: string;
  amount: string;
  description: string | null;
  notes: string | null;
  transactionDate: Date;
  archivedAt: Date | null;
  fromAccountId: string;
  toAccountId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PaginatedTransfers = {
  transfers: PublicTransfer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

function formatMoney(value: Prisma.Decimal | string | number): string {
  return new Prisma.Decimal(value).toFixed(2);
}

function toPublicTransfer(transfer: Transfer): PublicTransfer {
  return {
    id: transfer.id,
    amount: formatMoney(transfer.amount),
    description: transfer.description,
    notes: transfer.notes,
    transactionDate: transfer.transactionDate,
    archivedAt: transfer.archivedAt,
    fromAccountId: transfer.fromAccountId,
    toAccountId: transfer.toAccountId,
    createdAt: transfer.createdAt,
    updatedAt: transfer.updatedAt,
  };
}

async function requireOwnedTransfer(id: string, userId: string): Promise<Transfer> {
  const transfer = await transferRepository.findByIdForUser(id, userId);
  if (!transfer) {
    throw new NotFoundError("Transfer not found");
  }
  return transfer;
}

async function requireActiveOwnedAccount(
  accountId: string,
  userId: string,
  tx?: Prisma.TransactionClient,
): Promise<Account> {
  const client = tx ?? prisma;
  const account = await client.account.findFirst({
    where: { id: accountId, userId },
  });
  if (!account) {
    throw new NotFoundError("Account not found");
  }
  if (account.archivedAt) {
    throw new ValidationError("Cannot use an archived account");
  }
  return account;
}

async function applyTransferBalances(
  tx: Prisma.TransactionClient,
  fromAccountId: string,
  toAccountId: string,
  amount: Prisma.Decimal | string | number,
): Promise<void> {
  const value = new Prisma.Decimal(amount);
  await accountRepository.adjustBalance(fromAccountId, value.negated(), tx);
  await accountRepository.adjustBalance(toAccountId, value, tx);
}

async function reverseTransferBalances(
  tx: Prisma.TransactionClient,
  fromAccountId: string,
  toAccountId: string,
  amount: Prisma.Decimal | string | number,
): Promise<void> {
  const value = new Prisma.Decimal(amount);
  await accountRepository.adjustBalance(fromAccountId, value, tx);
  await accountRepository.adjustBalance(toAccountId, value.negated(), tx);
}

export const transferService = {
  async list(userId: string, query: ListTransfersQuery): Promise<PaginatedTransfers> {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const filters = {
      userId,
      from: query.from,
      to: query.to,
      accountId: query.accountId,
      includeArchived: query.includeArchived ?? false,
    };

    const [transfers, total] = await Promise.all([
      transferRepository.findManyForUser({ ...filters, skip, take: limit }),
      transferRepository.countForUser(filters),
    ]);

    return {
      transfers: transfers.map(toPublicTransfer),
      pagination: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  },

  async getById(userId: string, transferId: string): Promise<PublicTransfer> {
    const transfer = await requireOwnedTransfer(transferId, userId);
    return toPublicTransfer(transfer);
  },

  async create(userId: string, input: CreateTransferBody): Promise<PublicTransfer> {
    const created = await prisma.$transaction(async (tx) => {
      await requireActiveOwnedAccount(input.fromAccountId, userId, tx);
      await requireActiveOwnedAccount(input.toAccountId, userId, tx);

      const transfer = await transferRepository.create(
        {
          userId,
          fromAccountId: input.fromAccountId,
          toAccountId: input.toAccountId,
          amount: input.amount,
          description: input.description,
          notes: input.notes,
          transactionDate: input.transactionDate,
        },
        tx,
      );

      await applyTransferBalances(tx, input.fromAccountId, input.toAccountId, input.amount);
      return transfer;
    });

    return toPublicTransfer(created);
  },

  async update(
    userId: string,
    transferId: string,
    input: UpdateTransferBody,
  ): Promise<PublicTransfer> {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.transfer.findFirst({
        where: { id: transferId, userId },
      });
      if (!existing) {
        throw new NotFoundError("Transfer not found");
      }
      if (existing.archivedAt) {
        throw new ValidationError("Cannot update an archived transfer");
      }

      const nextFrom = input.fromAccountId ?? existing.fromAccountId;
      const nextTo = input.toAccountId ?? existing.toAccountId;
      const nextAmount = input.amount ?? formatMoney(existing.amount);

      if (nextFrom === nextTo) {
        throw new ValidationError("fromAccountId and toAccountId must be different");
      }

      if (input.fromAccountId) {
        await requireActiveOwnedAccount(input.fromAccountId, userId, tx);
      }
      if (input.toAccountId) {
        await requireActiveOwnedAccount(input.toAccountId, userId, tx);
      }

      const amountChanged =
        input.amount !== undefined &&
        !new Prisma.Decimal(input.amount).equals(existing.amount);
      const accountsChanged =
        nextFrom !== existing.fromAccountId || nextTo !== existing.toAccountId;

      if (amountChanged || accountsChanged) {
        await requireActiveOwnedAccount(nextFrom, userId, tx);
        await requireActiveOwnedAccount(nextTo, userId, tx);
        await reverseTransferBalances(
          tx,
          existing.fromAccountId,
          existing.toAccountId,
          existing.amount,
        );
        await applyTransferBalances(tx, nextFrom, nextTo, nextAmount);
      }

      return transferRepository.update(
        existing.id,
        {
          fromAccountId: input.fromAccountId,
          toAccountId: input.toAccountId,
          amount: input.amount,
          description: input.description,
          notes: input.notes,
          transactionDate: input.transactionDate,
        },
        tx,
      );
    });

    return toPublicTransfer(updated);
  },

  async archive(userId: string, transferId: string): Promise<PublicTransfer> {
    const archived = await prisma.$transaction(async (tx) => {
      const existing = await tx.transfer.findFirst({
        where: { id: transferId, userId },
      });
      if (!existing) {
        throw new NotFoundError("Transfer not found");
      }
      if (existing.archivedAt) {
        return existing;
      }

      await reverseTransferBalances(
        tx,
        existing.fromAccountId,
        existing.toAccountId,
        existing.amount,
      );
      return transferRepository.archive(existing.id, tx);
    });

    return toPublicTransfer(archived);
  },

  async unarchive(userId: string, transferId: string): Promise<PublicTransfer> {
    const restored = await prisma.$transaction(async (tx) => {
      const existing = await tx.transfer.findFirst({
        where: { id: transferId, userId },
      });
      if (!existing) {
        throw new NotFoundError("Transfer not found");
      }
      if (!existing.archivedAt) {
        return existing;
      }

      await requireActiveOwnedAccount(existing.fromAccountId, userId, tx);
      await requireActiveOwnedAccount(existing.toAccountId, userId, tx);
      await applyTransferBalances(
        tx,
        existing.fromAccountId,
        existing.toAccountId,
        existing.amount,
      );
      return transferRepository.unarchive(existing.id, tx);
    });

    return toPublicTransfer(restored);
  },
};
