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
import { useRef } from "react"

interface TableData {
    id: string
    label: string
    status: 'active' | 'inactive'
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

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dominio.com'

    let qrUrl = customUrl;

    if (!qrUrl && table) {
        qrUrl = typeof window !== 'undefined'
            ? `${window.location.protocol}//${tenantId}.${window.location.host.replace("admin.", "")}/menu?table=${table.id}`
            : `https://${tenantId}.tu-dominio.com/menu?table=${table.id}`
    }

    if (!qrUrl) qrUrl = origin; // Fallback

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
                const padding = 40;
                const textHeight = 40;
                canvas.width = img.width + padding
                canvas.height = img.height + padding + textHeight // Add space for text

                if (ctx) {
                    ctx.fillStyle = "white"
                    ctx.fillRect(0, 0, canvas.width, canvas.height)

                    // Draw QR
                    ctx.drawImage(img, padding / 2, padding / 2)

                    // Draw Label
                    ctx.font = "bold 16px Arial"
                    ctx.fillStyle = "black"
                    ctx.textAlign = "center"
                    ctx.fillText(label, canvas.width / 2, img.height + padding + (textHeight / 2) - 5)

                    const pngFile = canvas.toDataURL("image/png")
                    const downloadLink = document.createElement("a")
                    downloadLink.download = `QR-${label.replace(" ", "-")}.png`
                    downloadLink.href = pngFile
                    downloadLink.click()
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
