-- AlterForeignKey
ALTER TABLE "BudgetCategory" DROP CONSTRAINT "BudgetCategory_categoryId_fkey";
ALTER TABLE "BudgetCategory" ADD CONSTRAINT "BudgetCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
