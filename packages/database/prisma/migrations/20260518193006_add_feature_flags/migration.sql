-- Rename old features column to prevent data loss
ALTER TABLE "Tenant" RENAME COLUMN "features" TO "features_old";

-- CreateEnum
CREATE TYPE "TenantFeature" AS ENUM ('HAS_DIGITAL_MENU', 'HAS_WEB_CHECKOUT', 'HAS_WHATSAPP_CHECKOUT', 'HAS_POS');

-- Add new features column as the enum array
ALTER TABLE "Tenant" ADD COLUMN "features" "TenantFeature"[] DEFAULT ARRAY[]::"TenantFeature"[];

-- Populate the new features array from the old plans and features
UPDATE "Tenant"
SET "features" = CASE 
  -- 1. Mapear según el plan comercial actual (según PLAN_FEATURE_MAP)
  WHEN "plan" = 'restaurant_pos' THEN ARRAY['HAS_DIGITAL_MENU', 'HAS_WEB_CHECKOUT', 'HAS_WHATSAPP_CHECKOUT', 'HAS_POS']::"TenantFeature"[]
  WHEN "plan" = 'ecommerce_full' THEN ARRAY['HAS_DIGITAL_MENU', 'HAS_WEB_CHECKOUT', 'HAS_WHATSAPP_CHECKOUT']::"TenantFeature"[]
  WHEN "plan" = 'ecommerce_whatsapp' THEN ARRAY['HAS_DIGITAL_MENU', 'HAS_WHATSAPP_CHECKOUT']::"TenantFeature"[]
  WHEN "plan" = 'solo_menu_qr' THEN ARRAY['HAS_DIGITAL_MENU']::"TenantFeature"[]
  
  -- 2. Mapear según los antiguos features si el plan no está establecido
  WHEN 'RESTAURANT' = ANY("features_old") THEN ARRAY['HAS_DIGITAL_MENU', 'HAS_WEB_CHECKOUT', 'HAS_WHATSAPP_CHECKOUT']::"TenantFeature"[]
  WHEN 'SHOP' = ANY("features_old") THEN ARRAY['HAS_DIGITAL_MENU', 'HAS_WEB_CHECKOUT']::"TenantFeature"[]
  WHEN 'LMS' = ANY("features_old") THEN ARRAY['HAS_DIGITAL_MENU']::"TenantFeature"[]
  WHEN 'BLOG' = ANY("features_old") THEN ARRAY['HAS_DIGITAL_MENU']::"TenantFeature"[]
  
  -- 3. Fallback: Si tenía algún feature viejo, habilitar por defecto menú digital
  WHEN cardinality("features_old") > 0 THEN ARRAY['HAS_DIGITAL_MENU']::"TenantFeature"[]
  
  -- 4. Por defecto, array vacío
  ELSE ARRAY[]::"TenantFeature"[]
END;

-- Drop old features column
ALTER TABLE "Tenant" DROP COLUMN "features_old";

-- CreateTable JobLock
CREATE TABLE "JobLock" (
    "id" TEXT NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "instance" TEXT,

    CONSTRAINT "JobLock_pkey" PRIMARY KEY ("id")
);
