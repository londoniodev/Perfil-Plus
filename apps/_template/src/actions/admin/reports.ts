"use server"

import { prisma } from "@alvarosky/database"
import { getSessionUser } from "@/lib/auth-server"
import { startOfDay, endOfDay } from "date-fns"

export interface ZReport {
    totalSales: number
    orderCount: number
    byMethod: {
        method: string
        amount: number
        count: number
    }[]
    date: Date
}

export async function getZReport(date: Date = new Date()): Promise<{ success: boolean; data?: ZReport; error?: string }> {
    try {
        const user = await getSessionUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "CASHIER")) {
            return { success: false, error: "No autorizado" }
        }

        const start = startOfDay(date)
        const end = endOfDay(date)

        // 1. Get all payments for the day
        const payments = await prisma.payment.findMany({
            where: {
                createdAt: {
                    gte: start,
                    lte: end
                }
            }
        })

        // 2. Aggregate data
        const totalSales = payments.reduce((sum, p) => sum + Number(p.amount), 0)

        const methodsMap: Record<string, { amount: number; count: number }> = {}

        payments.forEach(p => {
            if (!methodsMap[p.method]) {
                methodsMap[p.method] = { amount: 0, count: 0 }
            }
            methodsMap[p.method].amount += Number(p.amount)
            methodsMap[p.method].count += 1
        })

        const byMethod = Object.entries(methodsMap).map(([method, data]) => ({
            method,
            ...data
        }))

        // 3. Count unique orders paid today
        const uniqueOrderIds = new Set(payments.map(p => p.orderId))

        return {
            success: true,
            data: {
                totalSales,
                orderCount: uniqueOrderIds.size,
                byMethod,
                date
            }
        }

    } catch (error) {
        console.error("Error generating Z Report:", error)
        return { success: false, error: "Error al generar reporte" }
    }
}
