-- AlterTable
ALTER TABLE "InventoryCountLine" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "OrderItemModifier" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "RecipeIngredient" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "WarehouseStock" ADD COLUMN     "tenantId" TEXT;

-- CreateIndex
CREATE INDEX "InventoryCountLine_tenantId_idx" ON "InventoryCountLine"("tenantId");

-- CreateIndex
CREATE INDEX "OrderItem_tenantId_idx" ON "OrderItem"("tenantId");

-- CreateIndex
CREATE INDEX "OrderItemModifier_tenantId_idx" ON "OrderItemModifier"("tenantId");

-- CreateIndex
CREATE INDEX "Payment_tenantId_idx" ON "Payment"("tenantId");

-- CreateIndex
CREATE INDEX "RecipeIngredient_tenantId_idx" ON "RecipeIngredient"("tenantId");

-- CreateIndex
CREATE INDEX "WarehouseStock_tenantId_idx" ON "WarehouseStock"("tenantId");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemModifier" ADD CONSTRAINT "OrderItemModifier_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseStock" ADD CONSTRAINT "WarehouseStock_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCountLine" ADD CONSTRAINT "InventoryCountLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
