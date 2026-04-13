-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ALERT', 'NEW_ORDER', 'HANDOFF');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "feedbackSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "TenantSettings" ADD COLUMN     "isWaBotActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "WaConversation" ADD COLUMN     "botEnabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "AppNotification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "branchId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppNotification_tenantId_createdAt_idx" ON "AppNotification"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "AppNotification_tenantId_type_idx" ON "AppNotification"("tenantId", "type");

-- AddForeignKey
ALTER TABLE "AppNotification" ADD CONSTRAINT "AppNotification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppNotification" ADD CONSTRAINT "AppNotification_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
