import { use } from "react"
import MenuClient from "@/components/menu/MenuClient"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { getTenantDesign } from "@/lib/tenant-server"
import { TenantFeature } from "@alvarosky/types"

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
    const features = headersList.get("x-tenant-features")?.split(",") || [];

    const restaurantFeature: TenantFeature = "RESTAURANT";
    if (!features.includes(restaurantFeature)) {
        return notFound();
    }

    const design = await getTenantDesign(slug)
    const layoutType = design?.brandSettings?.layoutType || 'INSTAGRAM'

    return <MenuClient slug={slug} table={table} layoutType={layoutType} />
}
