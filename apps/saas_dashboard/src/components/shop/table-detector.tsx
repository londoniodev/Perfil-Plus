"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"
import { useCart } from "@/store/use-cart"

function TableDetectorContent() {
    const searchParams = useSearchParams()
    const { setTableId } = useCart()

    useEffect(() => {
        const table = searchParams.get("table")
        if (table) {
            setTableId(table)
        }
    }, [searchParams, setTableId])

    return null
}

export function TableDetector() {
    return (
        <Suspense fallback={null}>
            <TableDetectorContent />
        </Suspense>
    )
}
