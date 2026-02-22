import { use } from "react"
import MenuClient from "@/components/menu/MenuClient"

// ─────────────────────────────────────────────
// Main Menu Page (Instagram Style)
// ─────────────────────────────────────────────
export default function MenuPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ table?: string }>
}) {
    const { slug } = use(params)
    const { table } = use(searchParams)

    return <MenuClient slug={slug} table={table} />
}
