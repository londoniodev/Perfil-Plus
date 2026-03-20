"use client"

import { useState, useRef, useEffect } from "react"
import {
    AdminPageWrapper,
    Button,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Badge,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    Card,
    CardContent,
    useToast,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    cn
} from "@alvarosky/ui"
import { Plus, MoreHorizontal, Download, Edit, Trash2, Search } from "lucide-react"
import { getTables, upsertTable, deleteTable } from "@/actions/admin/tables"
import { Table as TableType } from "@/actions/admin/tables"
import { TENANT_ID } from "@/lib/config"
import QRCode from "react-qr-code"

export default function TablesPage() {
    const toast = useToast()
    const [tables, setTables] = useState<TableType[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingTable, setEditingTable] = useState<TableType | null>(null)
    const [loading, setLoading] = useState(false)

    // Form State
    const [label, setLabel] = useState("")
    const [capacity, setCapacity] = useState<number>(4)
    const [status, setStatus] = useState<string>("ACTIVE")

    // Search State
    const [searchQuery, setSearchQuery] = useState("")

    // QR Download Logic - Refactored for Stability
    const qrContainerRef = useRef<HTMLDivElement>(null)
    const [downloadTarget, setDownloadTarget] = useState<{ url: string, label: string } | null>(null)

    useEffect(() => {
        if (downloadTarget) {
            console.log("⬇️ [QR] Inicio de proceso de descarga para:", downloadTarget.label);

            // Wait for React to update the QR code value in the DOM
            const timer = setTimeout(() => {
                const svg = qrContainerRef.current?.querySelector("svg")
                console.log("🔍 [QR] Buscando elemento SVG en ref...", svg ? "Encontrado" : "NO ENCONTRADO");

                if (svg) {
                    try {
                        const svgData = new XMLSerializer().serializeToString(svg)
                        const canvas = document.createElement("canvas")
                        const ctx = canvas.getContext("2d")

                        const img = new Image()

                        img.onload = () => {
                            console.log("🖼️ [QR] Imagen cargada, iniciando dibujo en Canvas...");
                            const qrSize = 500; // Base size requested
                            const padding = 50;
                            const fontSize = 32;
                            const lineHeight = 40;
                            const maxWidth = qrSize; // Max text width matches QR size

                            // Calculate Lines
                            const label = downloadTarget.label
                            const words = label.split(' ');
                            const lines: string[] = [];
                            let currentLine = words[0];

                            if (ctx) {
                                ctx.font = `bold ${fontSize}px Poppins, sans-serif`;

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
                                ctx.font = `bold ${fontSize}px Poppins, sans-serif`;
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

                                console.log("✅ [QR] Descarga iniciada.");
                                setDownloadTarget(null)
                            }
                        }

                        img.onerror = (err) => {
                            console.error("❌ [QR] Error al cargar la imagen SVG:", err);
                        };

                        img.src = "data:image/svg+xml;base64," + btoa(svgData)
                    } catch (error) {
                        console.error("❌ [QR] Error en el proceso de canvas:", error);
                    }
                } else {
                    console.error("❌ [QR] No se encontró el elemento SVG en el DOM.");
                }
            }, 300) // 300ms delay
            return () => clearTimeout(timer)
        }
    }, [downloadTarget])

    const handleDownloadQr = (url: string, label: string) => {
        setDownloadTarget({ url, label })
    }


    useEffect(() => {
        loadTables()
    }, [])

    const loadTables = async () => {
        const data = await getTables()
        setTables(data)
    }

    // Filter tables
    const filteredTables = tables.filter(t =>
        t.label.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Handlers
    const handleOpenAdd = () => {
        setEditingTable(null)
        setLabel("")
        setCapacity(4)
        setStatus("ACTIVE")
        setIsDialogOpen(true)
    }

    const handleEdit = (table: TableType) => {
        setEditingTable(table)
        setLabel(table.label)
        setCapacity(table.capacity || 4)
        setStatus(table.status)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm("¿Seguro que deseas eliminar esta mesa?")) {
            const res = await deleteTable(id)
            if (res.success) {
                setTables(prev => prev.filter(t => t.id !== id))
                toast.success("Mesa eliminada", "La mesa ha sido eliminada correctamente.")
            } else {
                toast.error("Error", "No se pudo eliminar la mesa")
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!label.trim()) {
            toast.error("Error", "El nombre es requerido")
            return
        }

        setLoading(true)
        const res = await upsertTable({
            id: editingTable?.id,
            label,
            capacity: capacity,
            status: status as any,
            x: 0,
            y: 0
        })
        setLoading(false)

        if (res.success) {
            await loadTables()
            setEditingTable(null)
            setLabel("")
            setCapacity(4)
            setStatus("ACTIVE")
            toast.success(editingTable ? "Mesa actualizada" : "Mesa creada")
            setIsDialogOpen(false)
        } else {
            toast.error("Error", res.error || "No se pudo guardar la mesa")
        }
    }

    const generalMenuUrl = typeof window !== 'undefined' ? `${window.location.origin}/menu` : ""

    return (
        <AdminPageWrapper
            title="Gestión de Mesas"
            description="Administra los puntos de venta y genera los códigos QR para pedidos."
            actions={
                <Button onClick={handleOpenAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Mesa
                </Button>
            }
        >
            <div className="space-y-6">

                {/* Search Bar */}
                <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar mesa por nombre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px] pl-4">Nombre del QR</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Puestos</TableHead>
                                <TableHead className="text-right pr-4">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* FIXED ROW: General */}
                            <TableRow className="bg-muted/30 hover:bg-muted/50">
                                <TableCell className="pl-4">
                                    <span className="font-bold text-primary">General</span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">General</Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">-</TableCell>
                                <TableCell className="text-right pr-4">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" className="bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-800 hover:text-white whitespace-nowrap" onClick={() => handleDownloadQr(generalMenuUrl, "General")}>
                                            Descargar QR
                                        </Button>
                                        <div className="w-9 h-9" aria-hidden="true"></div>
                                    </div>
                                </TableCell>
                            </TableRow>

                            {/* Dynamic Rows */}
                            {filteredTables.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No se encontraron mesas que coincidan con la búsqueda.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTables.map((table) => {
                                    const tableUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/menu?table=${table.id}`
                                    return (
                                        <TableRow key={table.id}>
                                            <TableCell className="font-medium pl-4">{table.label}</TableCell>
                                            <TableCell>
                                                <Badge variant={table.status === 'ACTIVE' ? 'default' : 'secondary'} className={table.status === 'ACTIVE' ? "bg-green-600 hover:bg-green-700" : ""}>
                                                    {table.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{table.capacity} pax</TableCell>
                                            <TableCell className="text-right pr-4">
                                                <div className="flex justify-end gap-2 items-center">
                                                    <Button variant="outline" size="sm" className="bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-800 hover:text-white whitespace-nowrap" onClick={() => handleDownloadQr(tableUrl, table.label)}>
                                                        Descargar QR
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleDelete(table.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Dialogo de Creación/Edición */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingTable ? "Editar Mesa" : "Nueva Mesa"}</DialogTitle>
                            <DialogDescription>
                                Configura el nombre y estado de la mesa. El código QR se generará automáticamente.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="label">Nombre / Número</Label>
                                <Input
                                    id="label"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    placeholder="Ej: Mesa 1, Barra, Terraza 2"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="capacity">Cantidad de Puestos</Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    min="1"
                                    value={capacity}
                                    onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                                    placeholder="Ej: 4"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Estado</Label>
                                <Select
                                    value={status}
                                    onValueChange={setStatus}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona el estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Activa</SelectItem>
                                        <SelectItem value="INACTIVE">Inactiva (Mantenimiento)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Guardando..." : (editingTable ? "Guardar Cambios" : "Crear Mesa")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Hidden QR for Generation - Always Rendered but Hidden */}
                <div
                    ref={qrContainerRef}
                    style={{ position: "absolute", opacity: 0, pointerEvents: "none", zIndex: -1 }}
                >
                    <QRCode
                        id="qr-target-svg"
                        value={downloadTarget?.url || "https://placeholder-qr.com"}
                        size={500} // High resolution base
                        viewBox={`0 0 500 500`}
                    />
                </div>
            </div>
        </AdminPageWrapper >
    )
}
