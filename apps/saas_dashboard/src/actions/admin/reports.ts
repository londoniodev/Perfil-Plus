"use server"

import { serverFetch } from "@/lib/api-server"
import { getSessionUser } from "@/lib/auth-server"
import { startOfDay, endOfDay } from "date-fns"

export interface ZReportProduct {
    productName: string
    variantName: string | null
    categoryName: string
    qty: number
    totalSales: number
    unitCost: number
    totalCost: number
    margin: number
}

export interface ZReport {
    totalSales: number
    orderCount: number
    byMethod: {
        method: string
        amount: number
        count: number
    }[]
    productSummary: ZReportProduct[]
    totalCost: number
    totalMargin: number
    date: Date
}

export async function getZReport(date: Date = new Date()): Promise<{ success: boolean; data?: ZReport; error?: string }> {
    try {
        const user = await getSessionUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN" && user.role !== "CASHIER")) {
            return { success: false, error: "No autorizado" }
        }

        const queryDate = startOfDay(date).toISOString() // Send the exact day bound

        const reportData = await serverFetch<any>(`/analytics/z-report?date=${queryDate}`)

        if (!reportData) {
            throw new Error("No se pudo parsear la respuesta del API")
        }

        // Reconversión del string Date al objeto Date del backend
        if (reportData.date) {
            reportData.date = new Date(reportData.date)
        }

        return {
            success: true,
            data: reportData as ZReport
        }

    } catch (error) {
        console.error("Error generating Z Report via API:", error)
        return { success: false, error: "Error al generar reporte Z" }
    }
}
