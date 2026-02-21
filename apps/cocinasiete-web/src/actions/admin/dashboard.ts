"use server"

import { prisma } from "@alvarosky/database"

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

// --- Helpers ---
function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1)
}

function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function daysAgo(days: number): Date {
    const d = new Date()
    d.setDate(d.getDate() - days)
    d.setHours(0, 0, 0, 0)
    return d
}

function calcGrowth(current: number, previous: number): number | null {
    if (previous === 0) return current > 0 ? 100 : null
    return Math.round(((current - previous) / previous) * 100)
}

// --- Server Action principal ---
export async function getDashboardStats(features: string[] = []): Promise<DashboardStats> {
    const now = new Date()
    const thisMonthStart = startOfMonth(now)
    const lastMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1))
    const todayStart = startOfDay(now)
    const thirtyDaysAgo = daysAgo(30)

    const hasShopOrRestaurant = features.includes("shop") || features.includes("restaurant")
    const hasBlog = features.includes("blog")
    const hasLMS = features.includes("lms")
    const hasRestaurant = features.includes("restaurant")

    // Core queries (always run)
    const pTotalUsers = prisma.user.count()
    const pNewUsersMonth = prisma.user.count({ where: { createdAt: { gte: thisMonthStart } } })
    const pUsersLastMonth = prisma.user.count({ where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } } })

    // Conditional queries
    const pRevenueThisMonth = hasShopOrRestaurant ? prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
            status: { in: ["APPROVED", "PROCESSING", "PREPARING", "READY", "SERVED", "SHIPPED", "DELIVERED"] },
            createdAt: { gte: thisMonthStart },
        },
    }) : Promise.resolve({ _sum: { totalAmount: 0 } })

    const pRevenueLastMonth = hasShopOrRestaurant ? prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
            status: { in: ["APPROVED", "PROCESSING", "PREPARING", "READY", "SERVED", "SHIPPED", "DELIVERED"] },
            createdAt: {
                gte: lastMonthStart,
                lt: thisMonthStart,
            },
        },
    }) : Promise.resolve({ _sum: { totalAmount: 0 } })

    const pPendingOrders = hasShopOrRestaurant ? prisma.order.count({
        where: { status: { in: ["PENDING", "APPROVED", "PROCESSING", "PREPARING"] } },
    }) : Promise.resolve(0)

    const pPublishedPosts = hasBlog ? prisma.post.count({ where: { published: true } }) : Promise.resolve(0)

    const pPublishedThemes = hasLMS ? prisma.theme.count({ where: { published: true } }) : Promise.resolve(0)
    const pTotalLessons = hasLMS ? prisma.lesson.count({ where: { published: true } }) : Promise.resolve(0)

    const pRestaurantOrdersToday = hasRestaurant ? prisma.order.count({
        where: { orderType: "DINE_IN", createdAt: { gte: todayStart } },
    }) : Promise.resolve(0)

    const pTopProduct = hasRestaurant ? prisma.orderItem.groupBy({
        by: ["productName"],
        _sum: { quantity: true },
        where: { order: { createdAt: { gte: todayStart }, orderType: "DINE_IN" } },
        orderBy: { _sum: { quantity: "desc" } },
        take: 1,
    }) : Promise.resolve([])

    const pRevenueByDay = hasShopOrRestaurant ? prisma.$queryRaw<{ date: Date; total: number }[]>`
            SELECT
                DATE("createdAt") as date,
                COALESCE(SUM("totalAmount"), 0)::float as total
            FROM "Order"
            WHERE "createdAt" >= ${thirtyDaysAgo}
              AND "status" IN ('APPROVED', 'PROCESSING', 'PREPARING', 'READY', 'SERVED', 'SHIPPED', 'DELIVERED')
            GROUP BY DATE("createdAt")
            ORDER BY date ASC
        ` : Promise.resolve([])

    const [
        totalUsers,
        newUsersThisMonth,
        usersLastMonth,
        revenueThisMonth,
        revenueLastMonth,
        pendingOrders,
        publishedPosts,
        publishedThemes,
        totalLessons,
        restaurantOrdersToday,
        topProductRaw,
        revenueByDayRaw,
    ] = await Promise.all([
        pTotalUsers,
        pNewUsersMonth,
        pUsersLastMonth,
        pRevenueThisMonth,
        pRevenueLastMonth,
        pPendingOrders,
        pPublishedPosts,
        pPublishedThemes,
        pTotalLessons,
        pRestaurantOrdersToday,
        pTopProduct,
        pRevenueByDay,
    ])

    // Procesar resultados
    const revThisMonth = Number(revenueThisMonth._sum.totalAmount ?? 0)
    const revLastMonth = Number(revenueLastMonth._sum.totalAmount ?? 0)

    return {
        totalUsers,
        newUsersThisMonth,
        userGrowthPercent: calcGrowth(newUsersThisMonth, usersLastMonth),
        totalRevenueThisMonth: revThisMonth,
        totalRevenueLastMonth: revLastMonth,
        revenueGrowthPercent: calcGrowth(revThisMonth, revLastMonth),
        pendingOrders,
        publishedPosts,
        publishedThemes,
        totalLessons,
        restaurantOrdersToday,
        topProductToday: topProductRaw.length > 0 ? topProductRaw[0].productName : null,
        revenueByDay: (revenueByDayRaw as any[]).map((r) => ({
            date: new Date(r.date).toISOString().split("T")[0],
            total: Number(r.total),
        })),
    }
}
