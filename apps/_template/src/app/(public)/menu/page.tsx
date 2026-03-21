import { headers } from "next/headers"
import { notFound } from "next/navigation"
import MenuClient from "@/components/menu/MenuClient"
import { getTenantDesign } from "@/lib/tenant-server"
import { TenantFeature } from "@alvarosky/types"

export default async function MenuPage({
    searchParams
}: {
    searchParams: Promise<{ table?: string }>
}) {
    const headersList = await headers()
    const tenantId = headersList.get("x-tenant-id") || "template"
    const features = headersList.get("x-tenant-features")?.split(",") || [];
    const { table } = await searchParams
    
    const restaurantFeature: TenantFeature = "RESTAURANT";
    if (!features.includes(restaurantFeature)) {
        return notFound();
    }
    
    // Obtener el diseño y el layoutType
    const design = await getTenantDesign(tenantId)
    const layoutType = design?.brandSettings?.layoutType || 'INSTAGRAM'

    return <MenuClient slug={tenantId} table={table} layoutType={layoutType} />
}
