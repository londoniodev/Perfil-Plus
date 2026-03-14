"use client"
import dynamic from 'next/dynamic'
import { Skeleton } from "@alvarosky/ui"

// Disable SSR to avoid window is not defined error from Leaflet
const MapPicker = dynamic(() => import('./map-component'), {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[250px] rounded-lg" />
})

export function LocationPicker({ 
    onLocationChange,
    initialLocation
}: { 
    onLocationChange: (loc: {lat: number, lng: number}) => void,
    initialLocation?: { lat: number, lng: number }
}) {
    return (
        <div className="w-full border rounded-lg overflow-hidden relative z-0">
            <MapPicker onLocationChange={onLocationChange} initialLocation={initialLocation} />
        </div>
    )
}
