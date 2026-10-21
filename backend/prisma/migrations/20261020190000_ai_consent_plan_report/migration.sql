-- AlterTable
ALTER TABLE "User" ADD COLUMN "aiConsentAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PlanReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlanReport_userId_idx" ON "PlanReport"("userId");

-- CreateIndex
CREATE INDEX "PlanReport_planId_idx" ON "PlanReport"("planId");

-- AddForeignKey
ALTER TABLE "PlanReport" ADD CONSTRAINT "PlanReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanReport" ADD CONSTRAINT "PlanReport_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
