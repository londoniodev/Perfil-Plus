"use client"

import { useEffect } from "react"
import { API_BASE } from "../lib/config"

export interface OrderEvent {
    type: 'new_order' | 'status_changed' | 'payment_received';
    orderId: string;
    data: Record<string, any>;
}

export function useOrderEvents(onEvent: (event: OrderEvent) => void) {
    useEffect(() => {
        let sse: EventSource | null = null;
        let isAborted = false;

        const connect = async () => {
            try {
                const sessionToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                if (!sessionToken) return;

                // 1. Fetch short-lived SSE token
                const res = await fetch(`${API_BASE}/auth/sse-token`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${sessionToken}`
                    }
                });

                if (!res.ok || isAborted) return;

                const { token: sseToken } = await res.json();
                if (!sseToken || isAborted) return;

                // 2. Connect with short-lived token
                const url = `${API_BASE}/orders/events?token=${sseToken}`
                sse = new EventSource(url)

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
                    // EventSource will automatically retry, but it will use the same (expired) token.
                    // So we close and reconnect manually to get a fresh token.
                    sse?.close();
                    if (!isAborted) setTimeout(connect, 3000);
                }
            } catch (error) {
                console.error("Error establishing SSE connection:", error);
                if (!isAborted) setTimeout(connect, 5000);
            }
        };

        connect();

        return () => {
            isAborted = true;
            sse?.close()
        }
    }, [onEvent])
}
