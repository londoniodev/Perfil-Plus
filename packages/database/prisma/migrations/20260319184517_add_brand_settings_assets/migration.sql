-- CreateEnum
CREATE TYPE "LayoutType" AS ENUM ('CLASSIC', 'INSTAGRAM', 'MINIMAL');

-- CreateTable
CREATE TABLE "BrandSettings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL DEFAULT '#09090b',
    "secondaryColor" TEXT NOT NULL DEFAULT '#f4f4f5',
    "borderRadius" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter, sans-serif',
    "layoutType" "LayoutType" NOT NULL DEFAULT 'CLASSIC',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BrandSettings_tenantId_key" ON "BrandSettings"("tenantId");

-- AddForeignKey
ALTER TABLE "BrandSettings" ADD CONSTRAINT "BrandSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
