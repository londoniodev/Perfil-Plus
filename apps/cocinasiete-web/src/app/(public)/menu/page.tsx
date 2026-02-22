import { headers } from "next/headers"
import MenuClient from "@/components/menu/MenuClient"
import { TENANT_ID } from "@/lib/config"

export default async function MenuPage({
    searchParams
}: {
    searchParams: Promise<{ table?: string }>
}) {
    const headersList = await headers()
    const tenantId = headersList.get("x-tenant-id") || TENANT_ID
    const { table } = await searchParams

    return <MenuClient slug={tenantId} table={table} />
}
