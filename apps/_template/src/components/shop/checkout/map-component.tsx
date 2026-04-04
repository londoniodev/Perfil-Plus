"use client"

import { useState, useRef, useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Locate, Loader2 } from 'lucide-react'
import { useMap } from 'react-leaflet'


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

function LocateControl({ setPosition, onLocationChange }: { setPosition: any, onLocationChange: any }) {
    const map = useMap()
    const [loading, setLoading] = useState(false)

    const handleLocateClick = () => {
        setLoading(true)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLoading(false)
                    const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                    setPosition(latlng)
                    onLocationChange(latlng)
                    map.flyTo(latlng, map.getZoom())
                },
                (error) => {
                    setLoading(false)
                    console.error("Error obteniendo ubicación:", error)
                    alert("No se pudo obtener la ubicación. Por favor permita el acceso a su GPS.")
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            )
        } else {
            setLoading(false)
            alert("Su navegador no soporta geolocalización.")
        }
    }

    return (
        <div className="leaflet-top leaflet-right" style={{ zIndex: 1000, pointerEvents: 'auto' }}>
            <div className="leaflet-control leaflet-bar" style={{ margin: '10px' }}>
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        handleLocateClick()
                    }}
                    disabled={loading}
                    className="bg-white hover:bg-gray-100 text-black flex items-center justify-center rounded shadow-sm border border-gray-300 transition-colors"
                    style={{ width: '34px', height: '34px', cursor: 'pointer' }}
                    aria-label="Usar mi ubicación"
                    title="Usar mi ubicación"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Locate className="w-5 h-5" />}
                </button>
            </div>
        </div>
    )
}


function MapUpdater({ position }: { position: any }) {
    const map = useMap()
    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom())
        }
    }, [position, map])
    return null
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
        if (initialLocation) {
            setPosition(initialLocation)
            onLocationChange(initialLocation)
        }
    }, [initialLocation, onLocationChange])

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
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
            />
            <LocationMarker position={position} setPosition={setPosition} onLocationChange={onLocationChange}/>
            <LocateControl setPosition={setPosition} onLocationChange={onLocationChange} />
            <MapUpdater position={position} />
        </MapContainer>
    )
}
