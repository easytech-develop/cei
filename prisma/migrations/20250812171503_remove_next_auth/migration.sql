/*
  Warnings:

  - You are about to drop the `NextAuthAccount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "private"."NextAuthAccount" DROP CONSTRAINT "NextAuthAccount_userId_fkey";

-- DropForeignKey
ALTER TABLE "private"."Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropTable
DROP TABLE "private"."NextAuthAccount";

-- DropTable
DROP TABLE "private"."Session";

-- DropTable
DROP TABLE "private"."VerificationToken";
