import { use } from "react"
import MenuClient from "@/components/menu/MenuClient"
import { getTenantDesign } from "@/lib/tenant-server"

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

    const design = await getTenantDesign(slug)
    const layoutType = design?.brandSettings?.layoutType || 'INSTAGRAM'

    return <MenuClient slug={slug} table={table} layoutType={layoutType} />
}
