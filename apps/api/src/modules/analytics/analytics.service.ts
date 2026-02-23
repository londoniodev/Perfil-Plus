import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

// Date Helpers (No dependencies)
function startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function startOfMonth(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), 1);
}

function subDays(d: Date, days: number): Date {
    return new Date(d.getTime() - days * 24 * 60 * 60 * 1000);
}

function formatYMD(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

@Injectable()
export class AnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    constructor(private readonly prisma: PrismaService) { }

    async getDashboardStats(tenantId: string) {
        const now = new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);
        const monthStart = startOfMonth(now);

        // 1. Total Revenue Historico (Muerte: tenantId obligado)
        const totalRevAgg = await this.prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { tenantId, status: OrderStatus.DELIVERED }
        });
        const totalRevenue = Number(totalRevAgg._sum?.totalAmount || 0);

        // 2. Conteo the órdenes histórico
        const totalOrders = await this.prisma.order.count({
            where: { tenantId }
        });

        // 3. Ventas de Hoy
        const todayRevAgg = await this.prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: {
                tenantId,
                status: OrderStatus.DELIVERED,
                createdAt: { gte: todayStart, lte: todayEnd }
            }
        });
        const todayRevenue = Number(todayRevAgg._sum?.totalAmount || 0);

        // Ordenes the hoy
        const restaurantOrdersToday = await this.prisma.order.count({
            where: {
                tenantId,
                createdAt: { gte: todayStart, lte: todayEnd }
            }
        });

        // Facturacion Mensual 
        const monthRevAgg = await this.prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: {
                tenantId,
                status: OrderStatus.DELIVERED,
                createdAt: { gte: monthStart, lte: todayEnd }
            }
        });
        const totalRevenueThisMonth = Number(monthRevAgg._sum?.totalAmount || 0);

        // Usuarios del tenant
        const totalUsers = await this.prisma.user.count({ where: { tenantId } });

        // 4. Sales Chart (últimos 30 días)
        const thirtyDaysAgo = startOfDay(subDays(now, 30));

        // Extraccion de transacciones the los ultimos 30 dias
        const last30DaysOrders = await this.prisma.order.findMany({
            where: {
                tenantId,
                status: OrderStatus.DELIVERED,
                createdAt: { gte: thirtyDaysAgo }
            },
            select: { createdAt: true, totalAmount: true }
        });

        // Mapear por día "YYYY-MM-DD"
        const sumByDay: Record<string, number> = {};

        for (const order of last30DaysOrders) {
            const dateStr = formatYMD(order.createdAt);
            sumByDay[dateStr] = (sumByDay[dateStr] || 0) + Number(order.totalAmount || 0);
        }

        // Construir arreglo the días vacíos para la gráfica
        const revenueByDay: { date: string, total: number }[] = [];
        for (let i = 29; i >= 0; i--) {
            const dStr = formatYMD(subDays(now, i));
            revenueByDay.push({
                date: dStr,
                total: sumByDay[dStr] || 0
            });
        }

        return {
            totalRevenue,
            todayRevenue,
            totalOrders,
            salesChart: revenueByDay,

            // Extras
            totalUsers,
            newUsersThisMonth: 0,
            userGrowthPercent: null,
            totalRevenueThisMonth,
            totalRevenueLastMonth: 0,
            revenueGrowthPercent: null,
            pendingOrders: 0,
            publishedPosts: 0,
            publishedThemes: 0,
            totalLessons: 0,
            restaurantOrdersToday,
            topProductToday: null,
            revenueByDay
        };
    }

    async getZReport(tenantId: string, dateParam?: string) {
        const targetDate = dateParam ? new Date(dateParam) : new Date();
        const startObj = startOfDay(targetDate);
        const endObj = endOfDay(targetDate);

        const ordersQuery = {
            tenantId,
            status: OrderStatus.DELIVERED,
            createdAt: { gte: startObj, lte: endObj }
        };

        // 1. Conteo de ordenes del dia
        const orderCount = await this.prisma.order.count({
            where: ordersQuery
        });

        // 2. Suma Total Ventas del día
        const salesAgg = await this.prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: ordersQuery
        });
        const totalSales = Number(salesAgg._sum?.totalAmount || 0);

        // 3. Ticket Promedio
        const avgTicket = orderCount > 0 ? totalSales / orderCount : 0;

        // 4. Desglose the ventas agrupadas por paymentMethod usando Prisma GroupBy en la tabla Payment
        const payments = await this.prisma.payment.findMany({
            where: {
                order: {
                    tenantId,
                    status: OrderStatus.DELIVERED,
                    createdAt: { gte: startObj, lte: endObj }
                }
            },
            select: {
                method: true,
                amount: true
            }
        });

        const groupedPayments: Record<string, { amount: number, count: number }> = {};
        for (const p of payments) {
            if (!groupedPayments[p.method]) {
                groupedPayments[p.method] = { amount: 0, count: 0 };
            }
            groupedPayments[p.method].amount += Number(p.amount);
            groupedPayments[p.method].count += 1;
        }

        const byMethod = Object.keys(groupedPayments).map(method => ({
            method,
            amount: groupedPayments[method].amount,
            count: groupedPayments[method].count
        }));

        return {
            success: true,
            data: {
                totalSales,
                orderCount,
                avgTicket,
                byMethod,
                date: targetDate,
            }
        };
    }
}
