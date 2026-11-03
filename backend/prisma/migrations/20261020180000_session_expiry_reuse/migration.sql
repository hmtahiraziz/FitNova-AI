-- AlterTable
ALTER TABLE "UserSession" ADD COLUMN "previousRefreshTokenHash" TEXT;
ALTER TABLE "UserSession" ADD COLUMN "expiresAt" TIMESTAMP(3);

-- Existing sessions: give a 30-day window from now so deploy does not mass-logout immediately.
UPDATE "UserSession" SET "expiresAt" = NOW() + INTERVAL '30 days' WHERE "expiresAt" IS NULL;

ALTER TABLE "UserSession" ALTER COLUMN "expiresAt" SET NOT NULL;

-- CreateIndex
CREATE INDEX "UserSession_previousRefreshTokenHash_idx" ON "UserSession"("previousRefreshTokenHash");
