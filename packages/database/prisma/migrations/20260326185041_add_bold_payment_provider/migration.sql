-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('MERCADO_PAGO', 'BOLD', 'CASH', 'NONE');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentExternalId" TEXT,
ADD COLUMN     "paymentProvider" "PaymentProvider" DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN     "activePaymentProvider" "PaymentProvider" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "boldApiKey" TEXT,
ADD COLUMN     "boldSecretKey" TEXT;

-- CreateIndex
CREATE INDEX "Order_paymentExternalId_idx" ON "Order"("paymentExternalId");

-- CreateIndex
CREATE INDEX "Order_tenantId_createdAt_idx" ON "Order"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_tenantId_status_createdAt_idx" ON "Order"("tenantId", "status", "createdAt");
