import { use } from "react"
import { OrderTrackerClient } from "./OrderTrackerClient"

export const metadata = {
    title: "Rastrear Pedido | Cocina Siete",
    description: "Rastrea el estado de tu pedido en tiempo real.",
}

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="container max-w-2xl mx-auto px-4">
                <OrderTrackerClient orderId={id} />
            </div>
        </div>
    )
}
