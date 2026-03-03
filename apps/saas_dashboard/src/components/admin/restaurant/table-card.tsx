"use client"

import QRCode from "react-qr-code"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    Button,
    Badge
} from "@alvarosky/ui"
import { Download, Edit, Trash2 } from "lucide-react"
import { useRef, useEffect, useState } from "react"

export interface TableData {
    id: string
    label: string
    status: string
    capacity?: number
    qrCode?: string | null
}

interface TableCardProps {
    table?: TableData
    customUrl?: string
    customLabel?: string
    tenantId: string
    onEdit?: (table: TableData) => void
    onDelete?: (id: string) => void
    hideActions?: boolean
}

export function TableCard({ table, customUrl, customLabel, tenantId, onEdit, onDelete, hideActions }: TableCardProps) {
    // URL format:
    // If customUrl is provided, use it.
    // Else, use table format: https://{tenant}.dominio.com/menu?table={id}

    const [qrUrl, setQrUrl] = useState<string>("")

    useEffect(() => {
        if (customUrl) {
            setQrUrl(customUrl)
        } else if (table) {
            const origin = window.location.origin
            // Construct URL dependent on subdomain logic needed? 
            // For now, let's use origin + /menu?table=ID
            // Adjust logic if you have specific subdomain requirements
            setQrUrl(`${origin}/${tenantId}/menu?table=${table.id}`)
        } else {
            setQrUrl(`${window.location.origin}/${tenantId}/menu`)
        }
    }, [customUrl, table, tenantId])

    // While mounting, show skeleton or empty? 
    // Or just render a default to avoid layout shift? 
    // Returning null for qrUrl might be okay if we handle it.

    // Better yet, just use a suppressed hydration warning if it's just the text, 
    // but the QR code itself might be different.

    // Let's rely on `mounted` state to render the QR and URL.
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{customLabel || table?.label || "QR Code"}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">Cargando QR...</span>
                </CardContent>
            </Card>
        )
    }

    const label = customLabel || table?.label || "QR Code";
    const status = table?.status || 'active';
    const uniqueId = table?.id || 'general';

    const downloadQr = () => {
        const svg = document.getElementById(`qr-${uniqueId}`)
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg)
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")
            const img = new Image()

            img.onload = () => {
                const qrSize = 500; // Base size requested
                const padding = 50;
                const fontSize = 32;
                const lineHeight = 40;
                const maxWidth = qrSize; // Max text width matches QR size

                // Calculate Lines
                const words = label.split(' ');
                const lines = [];
                let currentLine = words[0];

                if (ctx) {
                    ctx.font = `bold ${fontSize}px Arial`;

                    for (let i = 1; i < words.length; i++) {
                        const word = words[i];
                        const width = ctx.measureText(currentLine + " " + word).width;
                        if (width < maxWidth) {
                            currentLine += " " + word;
                        } else {
                            lines.push(currentLine);
                            currentLine = word;
                        }
                    }
                    lines.push(currentLine);

                    const textSectionHeight = (lines.length * lineHeight) + padding; // Extra padding at bottom

                    // Set Canvas Size
                    canvas.width = qrSize + (padding * 2);
                    canvas.height = qrSize + (padding * 2) + textSectionHeight - padding; // adjust vertical space

                    // Draw Background
                    ctx.fillStyle = "white";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // Draw QR (Scaled)
                    ctx.drawImage(img, padding, padding, qrSize, qrSize);

                    // Draw Text
                    ctx.font = `bold ${fontSize}px Arial`;
                    ctx.fillStyle = "black";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle"; // Helps with vertical centering per line

                    const textStartX = canvas.width / 2;
                    let textStartY = padding + qrSize + 40; // Start below QR

                    lines.forEach((line) => {
                        ctx.fillText(line, textStartX, textStartY);
                        textStartY += lineHeight;
                    });

                    const pngFile = canvas.toDataURL("image/png");
                    const downloadLink = document.createElement("a");
                    downloadLink.download = `QR-${label.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
                    downloadLink.href = pngFile;
                    downloadLink.click();
                }
            }
            img.src = "data:image/svg+xml;base64," + btoa(svgData)
        }
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{label}</CardTitle>
                    {table && (
                        <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                            {status === 'active' ? 'Activa' : 'Inactiva'}
                        </Badge>
                    )}
                    {!table && <Badge variant="outline">General</Badge>}
                </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6 space-y-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <QRCode
                        id={`qr-${uniqueId}`}
                        value={qrUrl}
                        size={150}
                        viewBox={`0 0 150 150`}
                    />
                </div>
                <p className="text-xs text-muted-foreground text-center break-all px-2">
                    {qrUrl}
                </p>
            </CardContent>
            <CardFooter className="bg-muted/50 p-3 grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={downloadQr} className={hideActions ? "col-span-3 w-full" : "w-full"} title="Descargar QR">
                    <Download className="h-4 w-4 mr-2" />
                    {hideActions ? "Descargar QR" : ""}
                </Button>
                {!hideActions && onEdit && table && (
                    <Button variant="outline" size="sm" onClick={() => onEdit(table)} className="w-full" title="Editar">
                        <Edit className="h-4 w-4" />
                    </Button>
                )}
                {!hideActions && onDelete && table && (
                    <Button variant="destructive" size="sm" onClick={() => onDelete(table.id)} className="w-full" title="Eliminar">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
