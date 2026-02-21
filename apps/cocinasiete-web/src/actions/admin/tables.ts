"use server"

import { prisma } from "@alvarosky/database"
import { getSessionUser } from "@/lib/auth-server"
import { revalidatePath } from "next/cache"
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
        const tables = await prisma.table.findMany({
            orderBy: { label: 'asc' } // Simple alphanumeric sort for now
        })
        return tables
    } catch (error) {
        console.error("Error fetching tables:", error)
        return []
    }
}

export async function upsertTable(data: z.infer<typeof tableSchema>) {
    try {
        const user = await getSessionUser()

        if (!user || user.role !== "ADMIN") {
            return { success: false, error: "No autorizado (Rol o Sesión inválida)" }
        }

        const validated = tableSchema.parse(data)

        if (validated.id) {
            // Update
            await prisma.table.update({
                where: { id: validated.id },
                data: {
                    label: validated.label,
                    capacity: validated.capacity,
                    status: validated.status,
                    x: validated.x,
                    y: validated.y
                }
            })
        } else {
            // Create
            await prisma.table.create({
                data: {
                    label: validated.label,
                    capacity: validated.capacity,
                    status: validated.status,
                    x: validated.x,
                    y: validated.y,
                    // Generate pseudo-QR for now
                    qrCode: `https://example.com/menu?table=${encodeURIComponent(validated.label)}`
                }
            })
        }

        revalidatePath("/admin/restaurant/tables")
        revalidatePath("/admin/restaurant/pos")
        return { success: true }
    } catch (error) {
        console.error("Upsert Table Error:", error)
        const message = error instanceof Error ? error.message : "Error desconocido"
        return { success: false, error: `Error al guardar: ${message}` }
    }
}

export async function deleteTable(id: string) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "ADMIN") throw new Error("Unauthorized")

        await prisma.table.delete({ where: { id } })

        revalidatePath("/admin/restaurant/tables")
        revalidatePath("/admin/restaurant/pos")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete table" }
    }
}
