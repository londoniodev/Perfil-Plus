"use client"

import { useState } from "react"
import { toast } from "sonner"

interface UseDigitalProductProps {
    productId: string
    orderId?: string
}

export function useDigitalProduct({ productId, orderId }: UseDigitalProductProps) {
    const [isDownloading, setIsDownloading] = useState(false)

    const download = async () => {
        if (!orderId) {
            toast.error("No se encontró la orden de compra asociada.")
            return
        }

        setIsDownloading(true)
        try {
            // Should come from env, but for now assuming /api proxy setup or absolute URL if needed.
            // In a monorepo, web usually proxies /api to backend.
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/orders/${orderId}/download/${productId}`, {
                method: "GET",
                headers: {
                    // Start with basic fetch, assuming auth token is handled via cookie or interceptor.
                    // If using JWT in header, we might need a useAuth hook to get the token here.
                    // For now, let's assume standard fetch with credentials if needed, or that the consumer app handles global fetch setup.
                    // Re-reading context: User uses JwtAuthGuard.
                    // We probably need the token. However, this is a UI package.
                    // Best practice: The UI component shouldn't ideally manage the fetch auth logic directly if it's generic.
                    // But for this specific task, I'll assume usage context has auth or I'll try to get it from localStorage if standard.
                    "Authorization": `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`
                }
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || "Error al iniciar la descarga")
            }

            const data = await response.json()

            if (data.downloadUrl) {
                // Secure download: Create hidden link and click it
                const link = document.createElement("a")
                link.href = data.downloadUrl
                link.target = "_blank"
                link.rel = "noopener noreferrer"
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                toast.success("Descarga iniciada")
            } else {
                throw new Error("URL de descarga no válida")
            }

        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : "Error desconocido al descargar")
        } finally {
            setIsDownloading(false)
        }
    }

    return {
        download,
        isDownloading
    }
}
