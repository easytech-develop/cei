/*
  Warnings:

  - The values [OVERDUE] on the enum `InstallmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `installmentId` on the `Transaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[document]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[direction,contactId,series,documentNumber]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "private"."JournalSide" AS ENUM ('DEBIT', 'CREDIT');

-- AlterEnum
BEGIN;
CREATE TYPE "private"."InstallmentStatus_new" AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID', 'CANCELLED');
ALTER TABLE "private"."Installment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "private"."Installment" ALTER COLUMN "status" TYPE "private"."InstallmentStatus_new" USING ("status"::text::"private"."InstallmentStatus_new");
ALTER TYPE "private"."InstallmentStatus" RENAME TO "InstallmentStatus_old";
ALTER TYPE "private"."InstallmentStatus_new" RENAME TO "InstallmentStatus";
DROP TYPE "private"."InstallmentStatus_old";
ALTER TABLE "private"."Installment" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "private"."Transaction" DROP CONSTRAINT "Transaction_installmentId_fkey";

-- DropIndex
DROP INDEX "private"."Account_name_code_idx";

-- DropIndex
DROP INDEX "private"."CashAccount_name_accountNumber_idx";

-- DropIndex
DROP INDEX "private"."Contact_name_document_idx";

-- DropIndex
DROP INDEX "private"."CostCenter_name_code_idx";

-- DropIndex
DROP INDEX "private"."Document_documentNumber_fiscalKey_idx";

-- AlterTable
ALTER TABLE "private"."Account" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "private"."CashAccount" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "private"."Category" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "private"."Contact" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "private"."CostCenter" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "private"."Document" ADD COLUMN     "billingRuleId" TEXT,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "private"."Installment" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "private"."Transaction" DROP COLUMN "installmentId",
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- CreateTable
CREATE TABLE "private"."BillingRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lateFeePercent" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "interestMonthly" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "discountPercent" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "notes" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BillingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."TransactionAllocation" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "installmentId" TEXT NOT NULL,
    "principal" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "interest" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "fine" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "discount" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."CashTransfer" (
    "id" TEXT NOT NULL,
    "fromAccountId" TEXT NOT NULL,
    "toAccountId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "outTransactionId" TEXT,
    "inTransactionId" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."JournalEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "competenceAt" TIMESTAMP(3) NOT NULL,
    "memo" TEXT,
    "originTable" TEXT,
    "originId" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."JournalLine" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "side" "private"."JournalSide" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "costCenterId" TEXT,
    "documentId" TEXT,
    "installmentId" TEXT,
    "transactionId" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TransactionAllocation_installmentId_idx" ON "private"."TransactionAllocation"("installmentId");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionAllocation_transactionId_installmentId_key" ON "private"."TransactionAllocation"("transactionId", "installmentId");

-- CreateIndex
CREATE UNIQUE INDEX "CashTransfer_outTransactionId_key" ON "private"."CashTransfer"("outTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "CashTransfer_inTransactionId_key" ON "private"."CashTransfer"("inTransactionId");

-- CreateIndex
CREATE INDEX "CashTransfer_date_idx" ON "private"."CashTransfer"("date");

-- CreateIndex
CREATE INDEX "CashTransfer_fromAccountId_toAccountId_idx" ON "private"."CashTransfer"("fromAccountId", "toAccountId");

-- CreateIndex
CREATE INDEX "JournalEntry_date_idx" ON "private"."JournalEntry"("date");

-- CreateIndex
CREATE INDEX "JournalEntry_competenceAt_idx" ON "private"."JournalEntry"("competenceAt");

-- CreateIndex
CREATE INDEX "JournalLine_accountId_idx" ON "private"."JournalLine"("accountId");

-- CreateIndex
CREATE INDEX "JournalLine_costCenterId_idx" ON "private"."JournalLine"("costCenterId");

-- CreateIndex
CREATE INDEX "JournalLine_transactionId_idx" ON "private"."JournalLine"("transactionId");

-- CreateIndex
CREATE INDEX "Account_name_idx" ON "private"."Account"("name");

-- CreateIndex
CREATE INDEX "Account_code_idx" ON "private"."Account"("code");

-- CreateIndex
CREATE INDEX "CashAccount_name_idx" ON "private"."CashAccount"("name");

-- CreateIndex
CREATE INDEX "CashAccount_accountNumber_idx" ON "private"."CashAccount"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_document_key" ON "private"."Contact"("document");

-- CreateIndex
CREATE INDEX "Contact_name_idx" ON "private"."Contact"("name");

-- CreateIndex
CREATE INDEX "CostCenter_name_idx" ON "private"."CostCenter"("name");

-- CreateIndex
CREATE INDEX "CostCenter_code_idx" ON "private"."CostCenter"("code");

-- CreateIndex
CREATE INDEX "Document_dueAt_status_idx" ON "private"."Document"("dueAt", "status");

-- CreateIndex
CREATE INDEX "Document_contactId_idx" ON "private"."Document"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "Document_direction_contactId_series_documentNumber_key" ON "private"."Document"("direction", "contactId", "series", "documentNumber");

-- CreateIndex
CREATE INDEX "Installment_dueAt_status_idx" ON "private"."Installment"("dueAt", "status");

-- CreateIndex
CREATE INDEX "Transaction_cashAccountId_date_idx" ON "private"."Transaction"("cashAccountId", "date");

-- AddForeignKey
ALTER TABLE "private"."Document" ADD CONSTRAINT "Document_billingRuleId_fkey" FOREIGN KEY ("billingRuleId") REFERENCES "private"."BillingRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private"."TransactionAllocation" ADD CONSTRAINT "TransactionAllocation_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "private"."Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private"."TransactionAllocation" ADD CONSTRAINT "TransactionAllocation_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES "private"."Installment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private"."CashTransfer" ADD CONSTRAINT "CashTransfer_fromAccountId_fkey" FOREIGN KEY ("fromAccountId") REFERENCES "private"."CashAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private"."CashTransfer" ADD CONSTRAINT "CashTransfer_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "private"."CashAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private"."CashTransfer" ADD CONSTRAINT "CashTransfer_outTransactionId_fkey" FOREIGN KEY ("outTransactionId") REFERENCES "private"."Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private"."CashTransfer" ADD CONSTRAINT "CashTransfer_inTransactionId_fkey" FOREIGN KEY ("inTransactionId") REFERENCES "private"."Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private"."JournalLine" ADD CONSTRAINT "JournalLine_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "private"."JournalEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private"."JournalLine" ADD CONSTRAINT "JournalLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "private"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private"."JournalLine" ADD CONSTRAINT "JournalLine_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "private"."CostCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
