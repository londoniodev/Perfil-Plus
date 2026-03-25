"use server"

import { serverFetch } from "@/lib/api-server"
import { getSessionUser } from "@/lib/auth-server"
import { revalidateTag } from "next/cache"
import { z } from "zod"

// --- TYPES ---
export type Table = {
    id: string
    label: string
    capacity: number
    status: string
    qrCode: string | null
}

const tableSchema = z.object({
    id: z.string().optional(),
    label: z.string().min(1, "El nombre es requerido"),
    capacity: z.number().min(1, "La capacidad debe ser al menos 1"),
    status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"]).default("ACTIVE"),
    x: z.number().default(0),
    y: z.number().default(0)
})

// --- ACTIONS ---

export async function getTables() {
    try {
        const tables = await serverFetch<Table[]>('/tables')
        return tables || []
    } catch (error) {
        console.error("Error fetching tables:", error)
        return []
    }
}

export async function upsertTable(data: z.infer<typeof tableSchema>) {
    try {
        const user = await getSessionUser()

        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
            return { success: false, error: "No autorizado (Rol o Sesión inválida)" }
        }

        const validated = tableSchema.parse(data)

        if (validated.id) {
            // Update
            await serverFetch(`/tables/${validated.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    label: validated.label,
                    capacity: validated.capacity,
                    status: validated.status,
                    x: validated.x,
                    y: validated.y
                })
            })
        } else {
            // Create
            await serverFetch('/tables', {
                method: 'POST',
                body: JSON.stringify({
                    label: validated.label,
                    capacity: validated.capacity,
                    status: validated.status,
                    x: validated.x,
                    y: validated.y,
                    // QR could be generated logic handled at Backend securely
                })
            })
        }

        revalidateTag(`tenant-${user.tenantId}`, "default")
        return { success: true }
    } catch (error: any) {
        console.error("Upsert Table Error:", error)
        const message = error.message || "Error desconocido"
        return { success: false, error: `Error al guardar: ${message}` }
    }
}

export async function deleteTable(id: string) {
    try {
        const user = await getSessionUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) throw new Error("Unauthorized")

        await serverFetch(`/tables/${id}`, { method: 'DELETE' })

        revalidateTag(`tenant-${user.tenantId}`, "default")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete table" }
    }
}
