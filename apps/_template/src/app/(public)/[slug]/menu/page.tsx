import { use } from "react"
import MenuClient from "@/components/menu/MenuClient"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { getTenantDesign } from "@/lib/tenant-server"
import { TenantFeature } from "@alvarosky/features"
import { getTenantFeatures } from "@alvarosky/shared"

// ─────────────────────────────────────────────
// Main Menu Page (Instagram Style)
// ─────────────────────────────────────────────
export default async function MenuPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ table?: string }>
}) {
    const { slug } = await params
    const { table } = await searchParams

    const headersList = await headers()
    const features = getTenantFeatures(headersList);

    const restaurantFeature: TenantFeature = "RESTAURANT";
    if (!features.has(restaurantFeature)) {
        return notFound();
    }

    const design = await getTenantDesign(slug)
    const layoutType = design?.brandSettings?.layoutType || 'INSTAGRAM'

    return <MenuClient table={table} layoutType={layoutType} />
}
