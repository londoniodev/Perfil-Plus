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

export default function MapPicker({ onLocationChange }: { onLocationChange: (loc: {lat: number, lng: number}) => void }) {
    // Cali, Colombia by default to match restaurant context or a standard location
    const defaultCenter = { lat: 3.4516, lng: -76.5320 }
    const [position, setPosition] = useState(defaultCenter)
    
    useEffect(() => {
        // Init with default position so form knows it
        onLocationChange(defaultCenter)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={true} style={{ height: "250px", width: "100%", zIndex: 0 }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} onLocationChange={onLocationChange}/>
        </MapContainer>
    )
}
