-- AlterTable
ALTER TABLE "private"."AuditLog" ADD COLUMN     "ip" TEXT,
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "private"."User" ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "image" TEXT;

-- CreateTable
CREATE TABLE "private"."NextAuthAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "NextAuthAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "NextAuthAccount_provider_providerAccountId_key" ON "private"."NextAuthAccount"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "private"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "private"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "private"."VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_at_idx" ON "private"."AuditLog"("entity", "entityId", "at");

-- AddForeignKey
ALTER TABLE "private"."NextAuthAccount" ADD CONSTRAINT "NextAuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "private"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "private"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
