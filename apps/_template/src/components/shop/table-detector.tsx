"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, Suspense, useState } from "react"
import { useCart } from "@/store/use-cart"
import { resolveTableInfo, getBranches } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button } from "@alvarosky/ui"
import { useTenant } from "@/app/providers"

function TableDetectorContent() {
    const searchParams = useSearchParams()
    const { tenantId } = useTenant()
    const { setTableId, setTableInfo, setBranchId, branchId } = useCart()
    const [branches, setBranches] = useState<{id: string, name: string}[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        const urlTable = searchParams.get("table")
        const urlT = searchParams.get("t")

        const initBranchContext = async () => {
            if (urlT) {
                // Nuevo flujo: resolver ID de mesa genérico
                try {
                    const info = await resolveTableInfo(urlT, tenantId)
                    setTableInfo({
                        tableId: urlT,
                        tableNumber: info.tableNumber,
                        branchId: info.branchId
                    })
                } catch (e) {
                    console.error("No se pudo resolver la mesa", e)
                }
            } else if (urlTable) {
                // Flujo legacy
                setTableId(urlTable)
                checkPublicBranches()
            } else {
                // Tráfico directo, no QR
                checkPublicBranches()
            }
        }

        const checkPublicBranches = async () => {
             // Si ya validamos una sucursal en el state, no hacer nada
             if (branchId) return;

             try {
                const availableBranches = await getBranches(tenantId)
                console.log(`[TableDetector] tenantId=${tenantId}, branches=${availableBranches.length}`)
                
                if (availableBranches.length > 1) {
                    setBranches(availableBranches)
                    setIsModalOpen(true)
                } else if (availableBranches.length === 1) {
                    // Solo hay una sede → seleccionarla automáticamente sin modal
                    setBranchId(availableBranches[0].id)
                }
                // Si length === 0, no hacemos nada
             } catch (e) {
                console.error("Error al obtener sucursales", e)
             }
        }

        initBranchContext()
    }, [searchParams, setTableId, setTableInfo, setBranchId, tenantId])

    if (!isModalOpen || branches.length <= 1) return null

    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e: any) => e.preventDefault()} onEscapeKeyDown={(e: any) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Elige una Sucursal</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3 py-4">
                    {branches.map((b) => (
                        <Button 
                            key={b.id} 
                            variant="outline" 
                            className="w-full justify-start py-6 text-lg"
                            onClick={() => {
                                setBranchId(b.id)
                                setIsModalOpen(false)
                            }}
                        >
                            {b.name}
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export function TableDetector() {
    return (
        <Suspense fallback={null}>
            <TableDetectorContent />
        </Suspense>
    )
}

