"use server"

import { serverFetch } from "@/lib/api-server"

// --- Tipos ---
export type DashboardStats = {
    // Core
    totalUsers: number
    newUsersThisMonth: number
    userGrowthPercent: number | null

    // Shop / Restaurant
    totalRevenueThisMonth: number
    totalRevenueLastMonth: number
    revenueGrowthPercent: number | null
    pendingOrders: number

    // Blog
    publishedPosts: number

    // LMS
    publishedThemes: number
    totalLessons: number

    // --- Nuevas Métricas Dinámicas ---
    totalRevenue: number
    totalOrders: number
    periodRevenue: number
    periodOrdersCount: number
    restaurantOrdersToday: number
    topProductToday: string | null

    // Arrays para Gráficas
    revenueByDay: { date: string; total: number }[]
    orderTypes: { type: string; count: number; total: number }[]
    paymentMethods: { method: string; count: number; total: number }[]
    topProducts: { productName: string; quantity: number }[]
    avgTicketByType: { type: string; avgTicket: number }[]
    productionTimes: { stage: string; minutes: number }[]
    productionTimesByProduct?: { productName: string; avgMinutes: number }[]
    recentOrders: {
        id: string;
        orderNumber: string;
        customerName: string | null;
        totalAmount: number;
        status: string;
        orderType: string;
        tableNumber: string | null;
        createdAt: string;
        itemCount: number;
    }[]
}

// --- Server Action principal ---
export async function getDashboardStats(features: string[] = [], period: string = '30d'): Promise<DashboardStats> {
    try {
        const queryParams = new URLSearchParams()
        features.forEach(f => queryParams.append('features', f))
        queryParams.append('period', period)

        const stats = await serverFetch<DashboardStats>(`/analytics/dashboard?${queryParams.toString()}`)

        if (!stats) {
            throw new Error("No se pudo obtener las estadísticas del Dashboard")
        }

        return stats
    } catch (e) {
        console.error("Error obteniendo Dashboard stats:", e)
        // Fallback robusto
        return {
            totalUsers: 0,
            newUsersThisMonth: 0,
            userGrowthPercent: null,
            totalRevenueThisMonth: 0,
            totalRevenueLastMonth: 0,
            revenueGrowthPercent: null,
            pendingOrders: 0,
            publishedPosts: 0,
            publishedThemes: 0,
            totalLessons: 0,
            restaurantOrdersToday: 0,
            topProductToday: null,
            totalRevenue: 0,
            totalOrders: 0,
            periodRevenue: 0,
            periodOrdersCount: 0,
            revenueByDay: [],
            orderTypes: [],
            paymentMethods: [],
            topProducts: [],
            avgTicketByType: [],
            productionTimes: [],
            recentOrders: []
        }
    }
}
