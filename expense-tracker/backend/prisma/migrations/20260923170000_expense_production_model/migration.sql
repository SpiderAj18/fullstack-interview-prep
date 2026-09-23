-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'UPI', 'CARD', 'NET_BANKING', 'OTHER');

-- Clear scaffold expenses that cannot satisfy required account/category
DELETE FROM "Expense";

-- Drop old indexes and optional category FK
DROP INDEX IF EXISTS "Expense_userId_date_idx";
DROP INDEX IF EXISTS "Expense_userId_categoryId_idx";
ALTER TABLE "Expense" DROP CONSTRAINT IF EXISTS "Expense_categoryId_fkey";

-- Rename date -> transactionDate
ALTER TABLE "Expense" RENAME COLUMN "date" TO "transactionDate";

-- Add new columns
ALTER TABLE "Expense" ADD COLUMN "merchant" TEXT;
ALTER TABLE "Expense" ADD COLUMN "notes" TEXT;
ALTER TABLE "Expense" ADD COLUMN "paymentMethod" "PaymentMethod";
ALTER TABLE "Expense" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Expense" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "Expense" ADD COLUMN "accountId" TEXT NOT NULL;

-- Make categoryId required
ALTER TABLE "Expense" ALTER COLUMN "categoryId" SET NOT NULL;

-- Indexes
CREATE INDEX "Expense_userId_transactionDate_idx" ON "Expense"("userId", "transactionDate");
CREATE INDEX "Expense_userId_accountId_transactionDate_idx" ON "Expense"("userId", "accountId", "transactionDate");
CREATE INDEX "Expense_userId_categoryId_transactionDate_idx" ON "Expense"("userId", "categoryId", "transactionDate");
CREATE INDEX "Expense_userId_archivedAt_idx" ON "Expense"("userId", "archivedAt");

-- Foreign keys
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
