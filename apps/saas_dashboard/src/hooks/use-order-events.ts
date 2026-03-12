"use client"

import { useEffect } from "react"
import { API_BASE } from "../lib/config"

export interface OrderEvent {
    type: 'new_order' | 'status_changed' | 'payment_received' | 'driver_assigned';
    orderId: string;
    data: Record<string, any>;
}

export function useOrderEvents(onEvent: (event: OrderEvent) => void) {
    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const url = `${API_BASE}/orders/events?token=${token || ''}`
        const sse = new EventSource(url)

        sse.onmessage = (e) => {
            try {
                const event = JSON.parse(e.data) as OrderEvent
                onEvent(event)
            } catch (err) {
                console.error("Error parsing SSE message:", err)
            }
        }

        sse.onerror = (err) => {
            console.error("SSE Connection Error:", err)
            // EventSource normally auto-reconnects, but we log it
        }

        return () => {
            sse.close()
        }
    }, [onEvent])
}
