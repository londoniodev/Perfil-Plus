import { headers } from "next/headers"
import MenuClient from "@/components/menu/MenuClient"
import { getTenantDesign } from "@/lib/tenant-server"

export default async function MenuPage({
    searchParams
}: {
    searchParams: Promise<{ table?: string }>
}) {
    const headersList = await headers()
    const tenantId = headersList.get("x-tenant-id") || "template"
    const { table } = await searchParams
    
    // Obtener el diseño y el layoutType
    const design = await getTenantDesign(tenantId)
    const layoutType = design?.brandSettings?.layoutType || 'INSTAGRAM'

    return <MenuClient slug={tenantId} table={table} layoutType={layoutType} />
}
