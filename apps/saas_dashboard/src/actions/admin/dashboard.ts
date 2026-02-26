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

    // Restaurant
    restaurantOrdersToday: number
    topProductToday: string | null

    // Chart: ingresos por día (últimos 30 días)
    revenueByDay: { date: string; total: number }[]
}

// --- Server Action principal ---
export async function getDashboardStats(features: string[] = []): Promise<DashboardStats> {
    try {
        // Delegar TODO el cálculo y query paramétricas masivas a NestJS
        // El endpoint /analytics/dashboard deberá crearse en NestJS para recibir los ?features= y manejar los cálculos
        const queryParams = new URLSearchParams()
        features.forEach(f => queryParams.append('features', f))

        const stats = await serverFetch<DashboardStats>(`/analytics/dashboard?${queryParams.toString()}`)

        if (!stats) {
            throw new Error("No se pudo obtener las estadísticas del Dashboard")
        }

        return stats
    } catch (e) {
        console.error("Error obteniendo Dashboard stats:", e)
        // Fallback robusto para no romper la UI si el endpoint aún no existe
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
            revenueByDay: []
        }
    }
}
