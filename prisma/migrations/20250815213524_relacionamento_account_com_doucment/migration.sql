-- AlterTable
ALTER TABLE "private"."Document" ADD COLUMN     "accountId" TEXT;

-- AddForeignKey
ALTER TABLE "private"."Document" ADD CONSTRAINT "Document_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "private"."Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
