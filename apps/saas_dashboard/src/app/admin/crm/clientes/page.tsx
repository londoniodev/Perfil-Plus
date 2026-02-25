import { serverFetch } from "@/lib/api-server"
import { ClientesClient } from "./clientes-client"

type Lead = {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    source: string | null
    status: string
    notes: string | null
    createdAt: string
}

type LeadStats = {
    total: number
    thisWeek: number
    bySource: { source: string | null; count: number }[]
    recentLeads: Lead[]
}

async function getLeads(): Promise<Lead[]> {
    try {
        return await serverFetch<Lead[]>("/leads")
    } catch {
        return []
    }
}

async function getLeadStats(): Promise<LeadStats | null> {
    try {
        return await serverFetch<LeadStats>("/leads/stats")
    } catch {
        return null
    }
}

export default async function ClientesPage() {
    const [leads, stats] = await Promise.all([getLeads(), getLeadStats()])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
                <p className="text-muted-foreground">
                    Personas que se registraron al hacer un pedido desde el menú.
                </p>
            </div>
            <ClientesClient initialLeads={leads} stats={stats} />
        </div>
    )
}
