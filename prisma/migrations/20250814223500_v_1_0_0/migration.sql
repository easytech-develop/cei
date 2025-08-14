/*
  Warnings:

  - You are about to drop the column `active` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `openingBalance` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the `Expense` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExpenseAttachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExpenseCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExpenseInstallment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExpenseItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExpensePayment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vendor` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `type` on the `Account` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "private"."ContactRole" AS ENUM ('CUSTOMER', 'SUPPLIER');

-- CreateEnum
CREATE TYPE "private"."AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "private"."CashAccountType" AS ENUM ('CASH', 'CHECKING', 'SAVINGS', 'INVESTMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "private"."DocumentDirection" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "private"."DocumentStatus" AS ENUM ('OPEN', 'PARTIALLY_PAID', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "private"."InstallmentStatus" AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "private"."PaymentMethod" AS ENUM ('PIX', 'CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'BOLETO', 'CHECK');

-- DropForeignKey
ALTER TABLE "private"."Expense" DROP CONSTRAINT "Expense_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "private"."Expense" DROP CONSTRAINT "Expense_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "private"."ExpenseAttachment" DROP CONSTRAINT "ExpenseAttachment_expenseId_fkey";

-- DropForeignKey
ALTER TABLE "private"."ExpenseCategory" DROP CONSTRAINT "ExpenseCategory_parentId_fkey";

-- DropForeignKey
ALTER TABLE "private"."ExpenseInstallment" DROP CONSTRAINT "ExpenseInstallment_expenseId_fkey";

-- DropForeignKey
ALTER TABLE "private"."ExpenseItem" DROP CONSTRAINT "ExpenseItem_expenseId_fkey";

-- DropForeignKey
ALTER TABLE "private"."ExpensePayment" DROP CONSTRAINT "ExpensePayment_accountId_fkey";

-- DropForeignKey
ALTER TABLE "private"."ExpensePayment" DROP CONSTRAINT "ExpensePayment_installmentId_fkey";

-- AlterTable
ALTER TABLE "private"."Account" DROP COLUMN "active",
DROP COLUMN "openingBalance",
ADD COLUMN     "code" TEXT,
ADD COLUMN     "parentId" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "private"."AccountType" NOT NULL;

-- DropTable
DROP TABLE "private"."Expense";

-- DropTable
DROP TABLE "private"."ExpenseAttachment";

-- DropTable
DROP TABLE "private"."ExpenseCategory";

-- DropTable
DROP TABLE "private"."ExpenseInstallment";

-- DropTable
DROP TABLE "private"."ExpenseItem";

-- DropTable
DROP TABLE "private"."ExpensePayment";

-- DropTable
DROP TABLE "private"."Vendor";

-- DropEnum
DROP TYPE "private"."ExpenseStatus";

-- DropEnum
DROP TYPE "private"."PaymentMethodType";

-- DropEnum
DROP TYPE "private"."PaymentStatus";

-- CreateTable
CREATE TABLE "private"."Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "roles" "private"."ContactRole"[] DEFAULT ARRAY[]::"private"."ContactRole"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."CashAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "private"."CashAccountType" NOT NULL,
    "agency" TEXT,
    "accountNumber" TEXT,
    "pixKey" TEXT,
    "accountId" TEXT,
    "openingBalance" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CashAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "direction" "private"."DocumentDirection" NOT NULL,
    "description" TEXT,
    "accountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."CostCenter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CostCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."Document" (
    "id" TEXT NOT NULL,
    "direction" "private"."DocumentDirection" NOT NULL,
    "contactId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "costCenterId" TEXT,
    "totalAmount" DECIMAL(18,2) NOT NULL,
    "issueAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "competenceAt" TIMESTAMP(3) NOT NULL,
    "status" "private"."DocumentStatus" NOT NULL DEFAULT 'OPEN',
    "documentNumber" TEXT,
    "fiscalKey" TEXT,
    "series" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."Installment" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "status" "private"."InstallmentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Installment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."Transaction" (
    "id" TEXT NOT NULL,
    "installmentId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(18,2) NOT NULL,
    "method" "private"."PaymentMethod" NOT NULL,
    "notes" TEXT,
    "cashAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contact_name_document_idx" ON "private"."Contact"("name", "document");

-- CreateIndex
CREATE INDEX "CashAccount_name_accountNumber_idx" ON "private"."CashAccount"("name", "accountNumber");

-- CreateIndex
CREATE INDEX "Category_name_direction_idx" ON "private"."Category"("name", "direction");

-- CreateIndex
CREATE INDEX "CostCenter_name_code_idx" ON "private"."CostCenter"("name", "code");

-- CreateIndex
CREATE INDEX "Document_documentNumber_fiscalKey_idx" ON "private"."Document"("documentNumber", "fiscalKey");

-- CreateIndex
CREATE UNIQUE INDEX "Installment_documentId_number_key" ON "private"."Installment"("documentId", "number");

-- CreateIndex
CREATE INDEX "Account_name_code_idx" ON "private"."Account"("name", "code");

-- AddForeignKey
ALTER TABLE "private"."Account" ADD CONSTRAINT "Account_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "private"."Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private"."CashAccount" ADD CONSTRAINT "CashAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "private"."Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private"."Category" ADD CONSTRAINT "Category_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "private"."Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private"."CostCenter" ADD CONSTRAINT "CostCenter_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "private"."CostCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private"."Document" ADD CONSTRAINT "Document_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "private"."Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private"."Document" ADD CONSTRAINT "Document_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "private"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private"."Document" ADD CONSTRAINT "Document_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "private"."CostCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private"."Installment" ADD CONSTRAINT "Installment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "private"."Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private"."Transaction" ADD CONSTRAINT "Transaction_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES "private"."Installment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private"."Transaction" ADD CONSTRAINT "Transaction_cashAccountId_fkey" FOREIGN KEY ("cashAccountId") REFERENCES "private"."CashAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
