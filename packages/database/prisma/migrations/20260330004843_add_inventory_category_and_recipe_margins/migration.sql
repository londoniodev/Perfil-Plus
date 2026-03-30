-- CreateEnum
CREATE TYPE "InventoryCategory" AS ENUM ('INGREDIENT', 'PACKAGING', 'CONSUMABLE', 'LABOR');

-- AlterTable
ALTER TABLE "InventoryItem" ADD COLUMN     "category" "InventoryCategory" NOT NULL DEFAULT 'INGREDIENT';

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "laborCost" DECIMAL(10,2),
ADD COLUMN     "targetMargin" DECIMAL(4,2);
