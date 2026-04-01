import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { OrderStatus } from '@alvarosky/database';

// Date Helpers (No dependencies)
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
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
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 60000; // 60 seg cache para evitar asfixiar DB

  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
  ) {}

  /** Lee el tenantId del contexto CLS (AsyncLocalStorage). */
  private getTenantId(): string {
    return this.cls.get<string>('tenantId') ?? '';
  }

  async getDashboardStats(period: string = '30d') {
    const tenantId = this.getTenantId();
    const now = new Date();
    const EndDate = endOfDay(now);
    let StartDate = startOfDay(now);

    switch (period) {
      case 'today':
        StartDate = startOfDay(now);
        break;
      case '7d':
        StartDate = startOfDay(subDays(now, 7));
        break;
      case '30d':
        StartDate = startOfDay(subDays(now, 30));
        break;
      case '3m':
        StartDate = startOfDay(subDays(now, 90));
        break;
      case '6m':
        StartDate = startOfDay(subDays(now, 180));
        break;
      default:
        StartDate = startOfDay(subDays(now, 30));
        break;
    }

    const cacheKey = `stats_${tenantId}_${period}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const dateQuery = { gte: StartDate, lte: EndDate };

    // ✅ this.prisma — tenantId se inyecta automáticamente por extensión Prisma
    const [totalRevAgg, totalOrders, periodRevAgg, periodOrdersCount] =
      await Promise.all([
        this.prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { status: OrderStatus.DELIVERED },
        }),
        this.prisma.order.count({}),
        this.prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { status: OrderStatus.DELIVERED, createdAt: dateQuery },
        }),
        this.prisma.order.count({ where: { createdAt: dateQuery } }),
      ]);

    const totalRevenue = Number(totalRevAgg._sum?.totalAmount || 0);
    const periodRevenue = Number(periodRevAgg._sum?.totalAmount || 0);

    // Revenue por día — JOINs complejos con GROUP BY DATE() no disponibles en Prisma Client
    const sumByDay: Record<string, number> = {};
    try {
      /* eslint-disable no-restricted-syntax */
      const revenueRaw = await this.prisma.$queryRaw<
        { date: Date; total: number }[]
      >`
        SELECT DATE("createdAt") as date, SUM("totalAmount") as total
        FROM "Order"
        WHERE "tenantId" = ${tenantId}
        AND "status" = 'DELIVERED'
        AND "createdAt" >= ${StartDate}
        AND "createdAt" <= ${EndDate}
        GROUP BY DATE("createdAt")
        ORDER BY DATE("createdAt") ASC
      `;
      /* eslint-enable no-restricted-syntax */
      for (const row of revenueRaw) {
        sumByDay[formatYMD(row.date)] = Number(row.total || 0);
      }
    } catch (e) {
      this.logger.error('Error fetching revenue raw for dashboard', e);
    }

    const revenueByDay: { date: string; total: number }[] = [];
    const diffDays = Math.ceil(
      (EndDate.getTime() - StartDate.getTime()) / (1000 * 3600 * 24),
    );
    for (let i = diffDays; i >= 0; i--) {
      const dStr = formatYMD(subDays(now, i));
      revenueByDay.push({ date: dStr, total: sumByDay[dStr] || 0 });
    }

    // ✅ Distribuciones categóricas — Prisma .secure
    const [
      orderTypeGroup,
      topProductsItems,
      ticketByTypeQuery,
      prodTimesAgg,
      totalUsers,
      recentOrdersRaw,
    ] = await Promise.all([
      this.prisma.order.groupBy({
        by: ['orderType'],
        _count: { id: true },
        _sum: { totalAmount: true },
        where: { createdAt: dateQuery },
      }),
      this.prisma.orderItem.groupBy({
        by: ['productName'],
        _sum: { quantity: true },
        where: {
          order: { createdAt: dateQuery, status: OrderStatus.DELIVERED },
        },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 15,
      }),
      this.prisma.order.groupBy({
        by: ['orderType'],
        _sum: { totalAmount: true },
        _count: { id: true },
        where: { createdAt: dateQuery, status: OrderStatus.DELIVERED },
      }),
      this.prisma.orderDeliveryAnalytics.aggregate({
        _avg: { timeToPrepare: true, timeToShip: true, timeToDeliver: true },
        where: { order: { createdAt: dateQuery } },
      }),
      this.prisma.user.count({}),
      this.prisma.order.findMany({
        where: { createdAt: dateQuery },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          totalAmount: true,
          status: true,
          orderType: true,
          tableNumber: true,
          createdAt: true,
          _count: { select: { items: true } },
        },
      }),
    ]);

    const orderTypes = orderTypeGroup.map((g) => ({
      type: g.orderType,
      count: g._count.id,
      total: Number(g._sum.totalAmount || 0),
    }));

    const topProducts = topProductsItems.map((p) => ({
      productName: p.productName,
      quantity: p._sum.quantity || 0,
    }));

    const avgTicketByType = ticketByTypeQuery.map((t) => ({
      type: t.orderType,
      avgTicket: t._count.id > 0 ? Number(t._sum.totalAmount) / t._count.id : 0,
    }));

    const productionTimes = [
      {
        stage: 'Preparation',
        minutes: Math.round(prodTimesAgg._avg.timeToPrepare || 0),
      },
      {
        stage: 'Shipping',
        minutes: Math.round(prodTimesAgg._avg.timeToShip || 0),
      },
      {
        stage: 'Delivery',
        minutes: Math.round(prodTimesAgg._avg.timeToDeliver || 0),
      },
    ];

    // Payment methods — queried via order relation (no tenantId manual necesario)
    const paymentGroup = await this.prisma.payment.groupBy({
      by: ['method'],
      _count: { id: true },
      _sum: { amount: true },
      where: { order: { createdAt: dateQuery } },
    });
    const paymentMethods = paymentGroup.map((g) => ({
      method: g.method,
      count: g._count.id,
      total: Number(g._sum.amount || 0),
    }));

    // Production times by product — multi-table JOIN inalcanzable con Prisma ORM
    let productionTimesByProduct: {
      productName: string;
      avgMinutes: number;
    }[] = [];
    try {
      /* eslint-disable no-restricted-syntax */
      const prodTimesByProductRaw = await this.prisma.$queryRaw<
        { productName: string; avgMinutes: number }[]
      >`
        SELECT oi."productName", COALESCE(AVG(oda."timeToShip"), 0) as "avgMinutes"
        FROM "OrderItem" oi
        JOIN "OrderDeliveryAnalytics" oda ON oi."orderId" = oda."orderId"
        JOIN "Order" o ON o.id = oi."orderId"
        WHERE o."tenantId" = ${tenantId}
        AND o."createdAt" >= ${StartDate}
        AND o."createdAt" <= ${EndDate}
        AND oda."timeToShip" IS NOT NULL
        GROUP BY oi."productName"
        ORDER BY "avgMinutes" DESC
        LIMIT 10
      `;
      /* eslint-enable no-restricted-syntax */
      productionTimesByProduct = prodTimesByProductRaw.map((r) => ({
        productName: r.productName,
        avgMinutes: Math.round(Number(r.avgMinutes || 0)),
      }));
    } catch (e) {
      this.logger.error(
        'Error fetching product prod times raw for dashboard',
        e,
      );
    }

    const recentOrders = recentOrdersRaw.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      totalAmount: Number(o.totalAmount),
      status: o.status,
      orderType: o.orderType,
      tableNumber: o.tableNumber,
      createdAt: o.createdAt.toISOString(),
      itemCount: o._count.items,
    }));

    const result = {
      totalRevenue,
      totalOrders,
      periodRevenue,
      periodOrdersCount,
      revenueByDay,
      orderTypes,
      paymentMethods,
      topProducts,
      avgTicketByType,
      productionTimes,
      productionTimesByProduct,
      recentOrders,
      totalUsers,
      restaurantOrdersToday: periodOrdersCount,
      topProductToday: topProducts[0]?.productName || null,
    };

    this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  async getZReport(dateParam?: string) {
    const tenantId = this.getTenantId();
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const startObj = startOfDay(targetDate);
    const endObj = endOfDay(targetDate);

    // ✅ El where de tenantId lo inyecta automáticamente .secure
    const ordersWhere = {
      status: OrderStatus.DELIVERED,
      createdAt: { gte: startObj, lte: endObj },
    };

    const [orderCount, salesAgg, paymentGroup] = await Promise.all([
      this.prisma.order.count({ where: ordersWhere }),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: ordersWhere,
      }),
      this.prisma.payment.groupBy({
        by: ['method'],
        _sum: { amount: true },
        _count: { id: true },
        where: {
          order: {
            status: OrderStatus.DELIVERED,
            createdAt: { gte: startObj, lte: endObj },
          },
        },
      }),
    ]);

    const totalSales = Number(salesAgg._sum?.totalAmount || 0);
    const avgTicket = orderCount > 0 ? totalSales / orderCount : 0;

    const byMethod = paymentGroup.map((g) => ({
      method: g.method,
      amount: Number(g._sum.amount || 0),
      count: g._count.id,
    }));

    // Desglose por producto: GROUP BY productName + variantId requerido
    // Es imposible replicar este GROUP BY compuesto con Prisma ORM (soporta solo un campo a la vez)
    /* eslint-disable no-restricted-syntax */
    const productBreakdown = await this.prisma.$queryRaw<
      {
        productName: string;
        variantId: string;
        variantName: string | null;
        categoryName: string | null;
        qty: number;
        totalSales: number;
      }[]
    >`
      SELECT
        oi."productName",
        oi."variantId",
        oi."variantName",
        MAX(c."name") as "categoryName",
        SUM(oi."quantity")::int as qty,
        SUM(oi."price" * oi."quantity")::float as "totalSales"
      FROM "OrderItem" oi
      JOIN "Order" o ON o.id = oi."orderId"
      LEFT JOIN "ProductVariant" pv ON pv."id" = oi."variantId"
      LEFT JOIN "Product" p ON p."id" = pv."productId"
      LEFT JOIN (
          SELECT "productId", MIN("categoryId") as "categoryId" 
          FROM "CategoriesOnProducts" 
          GROUP BY "productId"
      ) cop ON cop."productId" = p."id"
      LEFT JOIN "Category" c ON c."id" = cop."categoryId"
      WHERE o."tenantId" = ${tenantId}
        AND o."status" = 'DELIVERED'
        AND o."createdAt" >= ${startObj}
        AND o."createdAt" <= ${endObj}
      GROUP BY oi."productName", oi."variantId", oi."variantName"
      ORDER BY "totalSales" DESC
    `;
    /* eslint-enable no-restricted-syntax */

    const variantIds = [...new Set(productBreakdown.map((p) => p.variantId))];

    // Cálculo de costo por porción — JOINs Recipe → RecipeIngredient → InventoryItem
    // No replicable en Prisma ORM (requiere SUM sobre JOIN de 3 tablas con agrupación y NULLIF)
    /* eslint-disable no-restricted-syntax */
    const recipeCosts =
      variantIds.length > 0
        ? await this.prisma.$queryRaw<
            { variantId: string; costPerPortion: number }[]
          >`
            SELECT
              pv."id" AS "variantId",
              COALESCE(
                SUM(ri."quantity" * ri."wasteFactor" * ii."avgCost") / NULLIF(r."yield", 0),
                0
              )::float AS "costPerPortion"
            FROM "ProductVariant" pv
            JOIN "Recipe" r ON r."productId" = pv."productId"
            JOIN "RecipeIngredient" ri ON ri."recipeId" = r."id"
            JOIN "InventoryItem" ii ON ii."id" = ri."inventoryItemId"
            WHERE pv."id" = ANY(${variantIds})
            GROUP BY pv."id", r."yield"
          `
        : [];
    /* eslint-enable no-restricted-syntax */

    const costByVariant = new Map<string, number>();
    for (const rc of recipeCosts) {
      costByVariant.set(rc.variantId, rc.costPerPortion);
    }

    let totalCost = 0;
    const productSummary = productBreakdown.map((p) => {
      const unitCost = costByVariant.get(p.variantId) || 0;
      const itemTotalCost = unitCost * p.qty;
      const sales = Number(p.totalSales);
      const margin = sales > 0 ? ((sales - itemTotalCost) / sales) * 100 : 0;
      totalCost += itemTotalCost;

      return {
        productName: p.productName,
        variantName: p.variantName,
        categoryName: p.categoryName || 'Sin Categoría',
        qty: p.qty,
        totalSales: sales,
        unitCost: Math.round(unitCost * 100) / 100,
        totalCost: Math.round(itemTotalCost * 100) / 100,
        margin: Math.round(margin * 10) / 10,
      };
    });

    const totalMargin =
      totalSales > 0
        ? Math.round(((totalSales - totalCost) / totalSales) * 1000) / 10
        : 0;

    return {
      success: true,
      data: {
        totalSales,
        orderCount,
        avgTicket,
        byMethod,
        productSummary,
        totalCost: Math.round(totalCost * 100) / 100,
        totalMargin,
        date: targetDate,
      },
    };
  }
}
