/*
  Warnings:

  - Added the required column `type` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('EXPENSE', 'INCOME');

-- DropIndex
DROP INDEX "Category_userId_idx";

-- DropIndex
DROP INDEX "Category_userId_name_key";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "type" "CategoryType" NOT NULL;

-- CreateIndex
CREATE INDEX "Category_userId_type_archivedAt_idx" ON "Category"("userId", "type", "archivedAt");

-- CreateIndex
CREATE INDEX "Category_userId_parentId_idx" ON "Category"("userId", "parentId");

-- CreateIndex
CREATE INDEX "Category_userId_type_name_idx" ON "Category"("userId", "type", "name");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
