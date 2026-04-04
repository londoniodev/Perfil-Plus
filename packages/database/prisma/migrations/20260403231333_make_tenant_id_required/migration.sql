/*
  Warnings:

  - Made the column `tenantId` on table `InventoryCountLine` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tenantId` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tenantId` on table `OrderItemModifier` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tenantId` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tenantId` on table `RecipeIngredient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tenantId` on table `WarehouseStock` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "InventoryCountLine" DROP CONSTRAINT "InventoryCountLine_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItemModifier" DROP CONSTRAINT "OrderItemModifier_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "RecipeIngredient" DROP CONSTRAINT "RecipeIngredient_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "WarehouseStock" DROP CONSTRAINT "WarehouseStock_tenantId_fkey";

-- AlterTable
ALTER TABLE "InventoryCountLine" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "OrderItemModifier" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "RecipeIngredient" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "WarehouseStock" ALTER COLUMN "tenantId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemModifier" ADD CONSTRAINT "OrderItemModifier_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseStock" ADD CONSTRAINT "WarehouseStock_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCountLine" ADD CONSTRAINT "InventoryCountLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
