"use client"

import { useState, useRef, useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const customIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function LocationMarker({ position, setPosition, onLocationChange }: any) {
    const markerRef = useRef<L.Marker>(null)

    useMapEvents({
        click(e) {
            setPosition(e.latlng)
            onLocationChange({ lat: e.latlng.lat, lng: e.latlng.lng })
        },
    })
    
    const eventHandlers = useMemo(
        () => ({
        dragend() {
            const marker = markerRef.current
            if (marker != null) {
                const latlng = marker.getLatLng()
                setPosition(latlng)
                onLocationChange({ lat: latlng.lat, lng: latlng.lng })
            }
        },
        }),
        [setPosition, onLocationChange],
    )

    return position === null ? null : (
        <Marker 
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
            icon={customIcon}
        />
    )
}

export default function MapPicker({ 
    onLocationChange, 
    initialLocation 
}: { 
    onLocationChange: (loc: {lat: number, lng: number}) => void,
    initialLocation?: { lat: number, lng: number }
}) {
    // Cali, Colombia by default to match restaurant context or a standard location
    const defaultCenter = initialLocation || { lat: 3.4516, lng: -76.5320 }
    const [position, setPosition] = useState(defaultCenter)
    
    useEffect(() => {
        // Init with default position so form knows it
        onLocationChange(defaultCenter)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialLocation])

    return (
        <MapContainer 
            center={defaultCenter} 
            zoom={13} 
            scrollWheelZoom={true} 
            style={{ 
                height: "300px", 
                width: "100%", 
                zIndex: 0,
            }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} onLocationChange={onLocationChange}/>
        </MapContainer>
    )
}
