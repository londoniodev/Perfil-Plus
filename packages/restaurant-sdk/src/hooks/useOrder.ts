"use client"

import { useState } from 'react'
import { CartItem } from './useCart'

interface OrderData {
    cart: CartItem[]
    total: number
    customer?: {
        name: string
        phone: string
        tableNumber?: string
        notes?: string
        address?: string
    }
    shippingData?: {
        name: string
        phone: string
        address: string
        lat?: number
        lng?: number
    }
    paymentMethod?: string
    status?: string
}

export function useOrder() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createOrder = async (orderData: OrderData) => {
        setIsSubmitting(true)
        setError(null)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

            // Map Cart to CreateOrderDto
            const items = orderData.cart.map(item => ({
                variantId: item.variantId,
                quantity: item.quantity,
                notes: "", // Add logic if cart supports notes per item
                modifiers: item.modifiers.map(mod => ({
                    modifierId: mod.modifierId,
                    quantity: mod.quantity
                }))
            }))

            const payload = {
                items,
                orderType: orderData.shippingData ? "DELIVERY" : "DINE_IN",
                customerName: orderData.customer?.name || "Invitado",
                customerPhone: orderData.customer?.phone,
                notes: orderData.customer?.notes,
                tableNumber: orderData.customer?.tableNumber,
                paymentMethod: orderData.paymentMethod,
                status: orderData.status,
                shippingData: orderData.shippingData
            }

            const response = await fetch(`${apiUrl}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Error al crear la orden')
            }

            return { success: true, orderId: data.id, orderNumber: data.orderNumber }
        } catch (err) {
            console.error(err)
            const errorMessage = err instanceof Error ? err.message : "Error creando la orden"
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setIsSubmitting(false)
        }
    }

    const trackOrder = async (orderId: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            const response = await fetch(`${apiUrl}/orders/track/${orderId}`)
            if (!response.ok) return null
            return await response.json()
        } catch (err) {
            console.error("Tracking Error:", err)
            return null
        }
    }

    return {
        createOrder,
        trackOrder,
        isSubmitting,
        error
    }
}
