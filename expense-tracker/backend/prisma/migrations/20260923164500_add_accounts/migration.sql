-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('BANK', 'CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'WALLET', 'UPI');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "color" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "openingBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currentBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Account_userId_archivedAt_idx" ON "Account"("userId", "archivedAt");

-- CreateIndex
CREATE INDEX "Account_userId_type_idx" ON "Account"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_name_key" ON "Account"("userId", "name");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
