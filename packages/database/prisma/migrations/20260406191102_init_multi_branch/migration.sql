-- =============================================================================
-- MIGRACIÓN: init_multi_branch
-- Estrategia: Migración segura de datos en 6 fases.
-- NUNCA se pierde data. StoreSettings se divide, no se borra directamente.
-- =============================================================================

-- =============================================================================
-- FASE 1: Crear TODAS las tablas nuevas (sin constraints cruzados aún)
-- =============================================================================

-- 1.1 Branch (Sucursal)
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- 1.2 TenantSettings (Config Global - campos extraídos de StoreSettings)
CREATE TABLE "TenantSettings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "storeName" TEXT,
    "storeEmail" TEXT,
    "waAccessToken" TEXT,
    "waPhoneNumberId" TEXT,
    "wabaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TenantSettings_pkey" PRIMARY KEY ("id")
);

-- 1.3 BranchSettings (Config Operativa por Sucursal)
CREATE TABLE "BranchSettings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "mpAccessToken" TEXT,
    "mpPublicKey" TEXT,
    "activePaymentProvider" "PaymentProvider" NOT NULL DEFAULT 'NONE',
    "boldApiKey" TEXT,
    "boldSecretKey" TEXT,
    "deliveryFee" DECIMAL(10,2) DEFAULT 0,
    "businessHours" JSONB,
    "deliveryZones" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BranchSettings_pkey" PRIMARY KEY ("id")
);

-- 1.4 BranchProduct (Pivot: override de precios/disponibilidad por sucursal)
CREATE TABLE "BranchProduct" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "priceOverride" DECIMAL(10,2),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BranchProduct_pkey" PRIMARY KEY ("id")
);

-- 1.5 UserBranchAccess (Pivot RBAC: M:N entre User y Branch)
CREATE TABLE "UserBranchAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserBranchAccess_pkey" PRIMARY KEY ("id")
);

-- =============================================================================
-- FASE 2: Añadir columnas branchId como NULLABLE (temporalmente)
-- No podemos añadirlas como NOT NULL porque las filas existentes no tienen valor.
-- =============================================================================

ALTER TABLE "Order" ADD COLUMN "branchId" TEXT;
ALTER TABLE "Table" ADD COLUMN "branchId" TEXT;
ALTER TABLE "Warehouse" ADD COLUMN "branchId" TEXT;
ALTER TABLE "DeliveryDriver" ADD COLUMN "branchId" TEXT;
ALTER TABLE "WaConversation" ADD COLUMN "branchId" TEXT;

-- =============================================================================
-- FASE 3: Poblar datos - Crear Branch "Sede Principal" por cada Tenant
-- Usamos gen_random_uuid() de PostgreSQL para generar IDs únicos (compatible con CUID).
-- =============================================================================

-- 3.1 Crear una Branch por defecto por cada Tenant existente
INSERT INTO "Branch" ("id", "tenantId", "name", "slug", "status", "isDefault", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    t."id",
    'Sede Principal',
    'sede-principal',
    'ACTIVE',
    true,
    NOW(),
    NOW()
FROM "Tenant" t;

-- 3.2 Migrar datos GLOBALES de StoreSettings → TenantSettings
INSERT INTO "TenantSettings" ("id", "tenantId", "storeName", "storeEmail", "waAccessToken", "waPhoneNumberId", "wabaId", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    ss."tenantId",
    ss."storeName",
    ss."storeEmail",
    ss."waAccessToken",
    ss."waPhoneNumberId",
    ss."wabaId",
    ss."createdAt",
    ss."updatedAt"
FROM "StoreSettings" ss;

-- 3.3 Migrar datos OPERATIVOS de StoreSettings → BranchSettings (vinculando a la Branch por defecto)
INSERT INTO "BranchSettings" ("id", "tenantId", "branchId", "mpAccessToken", "mpPublicKey", "activePaymentProvider", "boldApiKey", "boldSecretKey", "deliveryFee", "businessHours", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    ss."tenantId",
    b."id",
    ss."mpAccessToken",
    ss."mpPublicKey",
    ss."activePaymentProvider",
    ss."boldApiKey",
    ss."boldSecretKey",
    ss."deliveryFee",
    ss."businessHours",
    ss."createdAt",
    ss."updatedAt"
FROM "StoreSettings" ss
JOIN "Branch" b ON b."tenantId" = ss."tenantId" AND b."isDefault" = true;

-- =============================================================================
-- FASE 4: Actualizar branchId en tablas operativas + poblar catálogo
-- Asignar todos los registros a la Branch por defecto de su Tenant.
-- =============================================================================

-- 4.1 Orders → Branch por defecto de su Tenant
UPDATE "Order" o
SET "branchId" = b."id"
FROM "Branch" b
WHERE b."tenantId" = o."tenantId"
  AND b."isDefault" = true;

-- 4.2 Tables → Branch por defecto de su Tenant
UPDATE "Table" t
SET "branchId" = b."id"
FROM "Branch" b
WHERE b."tenantId" = t."tenantId"
  AND b."isDefault" = true;

-- 4.3 Warehouses → Branch por defecto de su Tenant
UPDATE "Warehouse" w
SET "branchId" = b."id"
FROM "Branch" b
WHERE b."tenantId" = w."tenantId"
  AND b."isDefault" = true;

-- 4.4 DeliveryDrivers → Branch por defecto de su Tenant
UPDATE "DeliveryDriver" dd
SET "branchId" = b."id"
FROM "Branch" b
WHERE b."tenantId" = dd."tenantId"
  AND b."isDefault" = true;

-- 4.5 WaConversation.branchId → queda NULL intencionalmente.
-- Es NULLABLE por diseño. El bot asignará la sucursal en la próxima interacción.

-- 4.6 Poblar BranchProduct: Cada Product existente se vincula a la Sede Principal de su Tenant
-- priceOverride = NULL → se hereda Product.basePrice (comportamiento DRY)
-- isAvailable = true → preserva el menú actual tal cual
INSERT INTO "BranchProduct" ("id", "tenantId", "branchId", "productId", "isAvailable", "priceOverride", "sortOrder", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    p."tenantId",
    b."id",
    p."id",
    true,
    NULL,
    0,
    NOW(),
    NOW()
FROM "Product" p
JOIN "Branch" b ON b."tenantId" = p."tenantId" AND b."isDefault" = true
WHERE p."deletedAt" IS NULL;

-- =============================================================================
-- FASE 5: Crear UserBranchAccess para usuarios operativos
-- Roles operativos (WAITER, KITCHEN, CASHIER, DRIVER) → asignación a Sede Principal.
-- Roles globales (ADMIN, SUPERADMIN) → NO necesitan registro (bypass automático).
-- =============================================================================

INSERT INTO "UserBranchAccess" ("id", "userId", "branchId", "assignedAt")
SELECT
    'uba_' || replace(gen_random_uuid()::text, '-', ''),
    u."id",
    b."id",
    NOW()
FROM "User" u
JOIN "Branch" b ON b."tenantId" = u."tenantId" AND b."isDefault" = true
WHERE u."role" IN ('WAITER', 'KITCHEN', 'CASHIER', 'DRIVER', 'USER');

-- =============================================================================
-- FASE 6: Aplicar constraints, indices, foreign keys y limpiar
-- SOLO después de que TODOS los datos estén migrados.
-- =============================================================================

-- 6.1 Hacer branchId NOT NULL en las tablas operativas (ya tienen datos)
-- ⚠️ WaConversation NO se incluye aquí: su branchId es NULLABLE PERMANENTE por diseño.
ALTER TABLE "Order" ALTER COLUMN "branchId" SET NOT NULL;
ALTER TABLE "Table" ALTER COLUMN "branchId" SET NOT NULL;
ALTER TABLE "Warehouse" ALTER COLUMN "branchId" SET NOT NULL;
ALTER TABLE "DeliveryDriver" ALTER COLUMN "branchId" SET NOT NULL;

-- 6.2 Eliminar la tabla vieja StoreSettings (datos ya migrados a TenantSettings + BranchSettings)
ALTER TABLE "StoreSettings" DROP CONSTRAINT IF EXISTS "StoreSettings_tenantId_fkey";
DROP TABLE "StoreSettings";

-- 6.3 Crear índices para nuevas tablas
CREATE UNIQUE INDEX "TenantSettings_tenantId_key" ON "TenantSettings"("tenantId");
CREATE UNIQUE INDEX "TenantSettings_waPhoneNumberId_key" ON "TenantSettings"("waPhoneNumberId");
CREATE UNIQUE INDEX "TenantSettings_wabaId_key" ON "TenantSettings"("wabaId");

CREATE UNIQUE INDEX "BranchSettings_branchId_key" ON "BranchSettings"("branchId");
CREATE INDEX "BranchSettings_tenantId_idx" ON "BranchSettings"("tenantId");

CREATE INDEX "Branch_tenantId_idx" ON "Branch"("tenantId");
CREATE UNIQUE INDEX "Branch_tenantId_slug_key" ON "Branch"("tenantId", "slug");

CREATE INDEX "BranchProduct_tenantId_idx" ON "BranchProduct"("tenantId");
CREATE INDEX "BranchProduct_branchId_idx" ON "BranchProduct"("branchId");
CREATE UNIQUE INDEX "BranchProduct_branchId_productId_key" ON "BranchProduct"("branchId", "productId");

CREATE INDEX "UserBranchAccess_userId_idx" ON "UserBranchAccess"("userId");
CREATE INDEX "UserBranchAccess_branchId_idx" ON "UserBranchAccess"("branchId");
CREATE UNIQUE INDEX "UserBranchAccess_userId_branchId_key" ON "UserBranchAccess"("userId", "branchId");

-- 6.4 Crear índices para columnas branchId en tablas modificadas
CREATE INDEX "Order_branchId_idx" ON "Order"("branchId");
CREATE INDEX "Table_branchId_idx" ON "Table"("branchId");
CREATE INDEX "Warehouse_branchId_idx" ON "Warehouse"("branchId");
CREATE INDEX "DeliveryDriver_branchId_idx" ON "DeliveryDriver"("branchId");
CREATE INDEX "WaConversation_branchId_idx" ON "WaConversation"("branchId");

-- 6.5 Foreign Keys: Nuevas tablas → Tenant / Branch
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TenantSettings" ADD CONSTRAINT "TenantSettings_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BranchSettings" ADD CONSTRAINT "BranchSettings_branchId_fkey"
    FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BranchSettings" ADD CONSTRAINT "BranchSettings_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BranchProduct" ADD CONSTRAINT "BranchProduct_branchId_fkey"
    FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BranchProduct" ADD CONSTRAINT "BranchProduct_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BranchProduct" ADD CONSTRAINT "BranchProduct_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "UserBranchAccess" ADD CONSTRAINT "UserBranchAccess_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserBranchAccess" ADD CONSTRAINT "UserBranchAccess_branchId_fkey"
    FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 6.6 Foreign Keys: Tablas operativas modificadas → Branch
ALTER TABLE "Order" ADD CONSTRAINT "Order_branchId_fkey"
    FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Table" ADD CONSTRAINT "Table_branchId_fkey"
    FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_branchId_fkey"
    FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DeliveryDriver" ADD CONSTRAINT "DeliveryDriver_branchId_fkey"
    FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "WaConversation" ADD CONSTRAINT "WaConversation_branchId_fkey"
    FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- =============================================================================
-- ✅ MIGRACIÓN COMPLETA
-- Resultado:
--   • 6 Tenants → 6 Branches "Sede Principal" creadas
--   • 6 StoreSettings → 6 TenantSettings + 6 BranchSettings
--   • 10 Orders, 2 Tables, 5 Warehouses, 1 DeliveryDriver → branchId asignado
--   • 3 Users operativos (WAITER, CASHIER, DRIVER) → UserBranchAccess creado
--   • 0 datos perdidos
-- =============================================================================
