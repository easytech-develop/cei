/*
  Warnings:

  - You are about to alter the column `openingBalance` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `DoublePrecision`.
  - You are about to alter the column `totalNet` on the `Expense` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `DoublePrecision`.
  - You are about to alter the column `amount` on the `ExpenseInstallment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `DoublePrecision`.
  - You are about to alter the column `quantity` on the `ExpenseItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,4)` to `DoublePrecision`.
  - You are about to alter the column `unitPrice` on the `ExpenseItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,4)` to `DoublePrecision`.
  - You are about to alter the column `discount` on the `ExpenseItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `DoublePrecision`.
  - You are about to alter the column `total` on the `ExpenseItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `DoublePrecision`.
  - You are about to alter the column `amount` on the `ExpensePayment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "private"."Account" ALTER COLUMN "openingBalance" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "private"."Expense" ALTER COLUMN "totalNet" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "private"."ExpenseInstallment" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "private"."ExpenseItem" ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "unitPrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "discount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "total" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "private"."ExpensePayment" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;
