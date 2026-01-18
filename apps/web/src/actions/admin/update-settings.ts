"use server"

import { prisma } from "@mauromera/database"
import { getSessionUser } from "@/lib/auth-server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Schema de validación
const settingsSchema = z.object({
    mpAccessToken: z.string().optional(),
    mpPublicKey: z.string().optional(),
    storeName: z.string().optional(),
    storeEmail: z.string().email().optional().or(z.literal(""))
})

type UpdateSettingsInput = z.infer<typeof settingsSchema>

interface UpdateSettingsResult {
    success: boolean
    error?: string
}

/**
 * Server Action: Actualizar configuración de la tienda
 */
export async function updateSettings(data: UpdateSettingsInput): Promise<UpdateSettingsResult> {
    try {
        // 1. Verificar autenticación y permisos
        const user = await getSessionUser()

        if (!user) {
            redirect("/auth/login")
        }

        if (user.role !== "ADMIN") {
            return {
                success: false,
                error: "No tienes permisos para realizar esta acción"
            }
        }

        // 2. Validar datos
        const validated = settingsSchema.parse(data)

        // 3. Buscar configuración existente
        const existingSettings = await prisma.storeSettings.findFirst()

        // 4. Upsert (actualizar o crear)
        if (existingSettings) {
            // Actualizar existente
            await prisma.storeSettings.update({
                where: { id: existingSettings.id },
                data: {
                    mpAccessToken: validated.mpAccessToken || existingSettings.mpAccessToken,
                    mpPublicKey: validated.mpPublicKey || existingSettings.mpPublicKey,
                    storeName: validated.storeName || existingSettings.storeName,
                    storeEmail: validated.storeEmail || existingSettings.storeEmail,
                    updatedAt: new Date()
                }
            })
        } else {
            // Crear nuevo
            await prisma.storeSettings.create({
                data: {
                    mpAccessToken: validated.mpAccessToken || null,
                    mpPublicKey: validated.mpPublicKey || null,
                    storeName: validated.storeName || null,
                    storeEmail: validated.storeEmail || null
                }
            })
        }

        // 5. Revalidar rutas que usan settings
        revalidatePath("/admin/settings")
        revalidatePath("/checkout")

        return { success: true }

    } catch (error) {
        console.error("Error updating settings:", error)

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.errors[0].message
            }
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : "Error desconocido"
        }
    }
}
