"use client"

import { useState } from "react"
import { toast } from "sonner"

interface UseDigitalProductProps {
    productId?: string
    orderId?: string
}

export function useDigitalProduct(props?: UseDigitalProductProps) {
    const [isDownloading, setIsDownloading] = useState(false)
    const [isLoading, setIsLoading] = useState(false) // Alias for compatibility

    // Helper to get token
    const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : ''




    const getProductUrl = async (productId?: string, orderId?: string) => {
        const targetProductId = productId || props?.productId
        const targetOrderId = orderId || props?.orderId

        if (!targetProductId) throw new Error("Product ID required")

        setIsLoading(true)
        try {
            // New Logic: If no Order ID, try the smart access endpoint
            let url = "";
            if (targetOrderId) {
                url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/orders/${targetOrderId}/download/${targetProductId}`
            } else {
                url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/orders/product/${targetProductId}/download`
            }

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${getToken()}`
                }
            })

            if (!response.ok) {
                // handle error...
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || "Error al obtener URL")
            }

            const data = await response.json()
            return data.downloadUrl
        } catch (error) {
            console.error(error)
            // toast.error(error instanceof Error ? error.message : "Error") // Optional: maybe silent in hook? 
            return null
        } finally {
            setIsLoading(false)
        }
    }

    const download = async () => {
        const targetProductId = props?.productId
        const targetOrderId = props?.orderId

        if (!targetProductId) {
            toast.error("Datos de producto incompletos.")
            return
        }

        setIsDownloading(true)
        try {
            let urlEndpoint = "";
            if (targetOrderId) {
                urlEndpoint = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/orders/${targetOrderId}/download/${targetProductId}`
            } else {
                urlEndpoint = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/orders/product/${targetProductId}/download`
            }

            const response = await fetch(urlEndpoint, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${getToken()}`
                }
            })

            if (!response.ok) throw new Error("Error de descarga");
            const data = await response.json();

            if (data.downloadUrl) {
                const link = document.createElement("a")
                link.href = data.downloadUrl
                link.target = "_blank"
                link.rel = "noopener noreferrer"
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                toast.success("Descarga iniciada")
            } else {
                throw new Error("URL inválida")
            }

        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : "Error al descargar")
        } finally {
            setIsDownloading(false)
        }
    }

    return {
        download,
        getProductUrl,
        isDownloading,
        isLoading
    }
}
