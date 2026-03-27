-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN     "businessHours" JSONB;

-- CreateIndex
CREATE INDEX "Product_tenantId_published_isAvailable_idx" ON "Product"("tenantId", "published", "isAvailable");
