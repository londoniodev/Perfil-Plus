"use client"

import { useState } from "react"
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, useToast } from "@alvarosky/ui"
import { Truck, MapPin } from "lucide-react"

export function DriverActiveRoute({ driver, orders }: { driver: any, orders: any[] }) {
    if (!orders || orders.length === 0) return null;

    // Sort by sequence, or just fallback to creation date
    const sortedOrders = [...orders].sort((a, b) => (a.deliverySequence || 0) - (b.deliverySequence || 0));
    
    // We assume shippingData has structure { address: "..." }
    const waypoints = sortedOrders.map(o => o.shippingData?.address).filter(Boolean);
    
    if (waypoints.length === 0) return null;

    const generateMapsUrl = () => {
        const origin = encodeURIComponent("Mi Restaurante"); // Podría venir de settings
        const destination = encodeURIComponent(waypoints[waypoints.length - 1] as string);
        
        let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
        
        if (waypoints.length > 1) {
            const middleWaypoints = waypoints.slice(0, -1).map(w => encodeURIComponent(w as string)).join("|");
            url += `&waypoints=${middleWaypoints}`;
        }
        
        return url;
    }

    return (
        <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2"
            onClick={() => window.open(generateMapsUrl(), '_blank')}
        >
            <MapPin className="w-4 h-4 mr-2" aria-hidden="true" /> Ver Ruta en Maps
        </Button>
    )
}
