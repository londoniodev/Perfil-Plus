"use client"

import { useEffect, useState } from "react"
import { useBranchStore } from "@/store/use-branch-store"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@alvarosky/ui"
import { Building2 } from "lucide-react"

export function BranchSelector() {
    const { currentBranchId, branches, setBranch, setBranches } = useBranchStore()
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const fetchBranches = async () => {
            setIsLoading(true)
            try {
                // Usamos el cliente fetchAPI del dashboard que inyecta el token
                const response = await fetch('/api/branches', {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                if (response.ok) {
                    const data = await response.json()
                    setBranches(data)
                    
                    // Si no hay branch seleccionado, elegir el primero o el default
                    if (!currentBranchId && data.length > 0) {
                        const defaultBranch = data.find((b: any) => b.isDefault) || data[0]
                        setBranch(defaultBranch.id)
                    }
                }
            } catch (error) {
                console.error("Error fetching branches:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchBranches()
    }, [setBranches, setBranch, currentBranchId])

    if (branches.length <= 1 && !isLoading) return null

    return (
        <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Select 
                value={currentBranchId || ""} 
                onValueChange={(value) => setBranch(value)}
            >
                <SelectTrigger className="w-[180px] h-9 bg-background/50 border-border/50">
                    <SelectValue placeholder="Seleccionar Sucursal" />
                </SelectTrigger>
                <SelectContent>
                    {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
