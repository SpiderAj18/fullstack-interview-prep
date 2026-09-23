-- CreateTable
CREATE TABLE "Income" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "source" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "paymentMethod" "PaymentMethod",
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Income_userId_transactionDate_idx" ON "Income"("userId", "transactionDate");

-- CreateIndex
CREATE INDEX "Income_userId_accountId_transactionDate_idx" ON "Income"("userId", "accountId", "transactionDate");

-- CreateIndex
CREATE INDEX "Income_userId_categoryId_transactionDate_idx" ON "Income"("userId", "categoryId", "transactionDate");

-- CreateIndex
CREATE INDEX "Income_userId_archivedAt_idx" ON "Income"("userId", "archivedAt");

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
