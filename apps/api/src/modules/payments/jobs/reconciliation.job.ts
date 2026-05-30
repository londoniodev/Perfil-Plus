import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';
import { PaymentsService } from '../payments.service';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import axios from 'axios';

@Injectable()
export class PaymentsReconciliationJob {
  private readonly logger = new Logger(PaymentsReconciliationJob.name);
  private readonly LOCK_ID = 'payments_reconciliation';
  private readonly LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutos
  private readonly CONCURRENCY_LIMIT = 5;
  private readonly BATCH_DELAY_MS = 200;

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async reconcilePayments() {
    // 1. Bloqueo Distribuido (Optimización 1)
    const lockAcquired = await this.acquireLock();
    if (!lockAcquired) {
      this.logger.log('Another instance is already running the reconciliation. Skipping.');
      return;
    }

    try {
      this.logger.log('Starting optimized payments reconciliation...');

      const tenantsWithConfig = await this.prisma.systemSetting.findMany({
        where: { key: 'MERCADOPAGO_CONFIG' },
        select: { tenantId: true, value: true },
      });

      this.logger.log(`Found ${tenantsWithConfig.length} tenants to reconcile.`);

      // 2. Control de Concurrencia y Throttling (Optimización 2)
      // Procesamos en lotes para no saturar la API de MP ni el pool de conexiones
      for (let i = 0; i < tenantsWithConfig.length; i += this.CONCURRENCY_LIMIT) {
        const batch = tenantsWithConfig.slice(i, i + this.CONCURRENCY_LIMIT);
        
        await Promise.all(batch.map(async (setting) => {
          try {
            await this.reconcileTenantPayments(setting.tenantId, setting.value);
            // Pequeño delay para respetar el rate limit de MP
            await new Promise(resolve => setTimeout(resolve, this.BATCH_DELAY_MS));
          } catch (error) {
            this.logger.error(`Failed to reconcile tenant ${setting.tenantId}: ${error.message}`);
          }
        }));
      }

      this.logger.log('Payments reconciliation completed.');
    } finally {
      await this.releaseLock();
    }
  }

  private async reconcileTenantPayments(tenantId: string, configValue: any) {
    const config = typeof configValue === 'string' ? JSON.parse(configValue) : configValue;
    if (!config.accessToken) return;

    const client = new MercadoPagoConfig({ accessToken: config.accessToken });
    const paymentClient = new Payment(client);

    const beginDate = new Date();
    beginDate.setHours(beginDate.getHours() - 12); // Reducido a 12h por mayor frecuencia del cron

    const searchResults = await paymentClient.search({
      options: {
        status: 'approved',
        range: 'date_created',
        begin_date: beginDate.toISOString(),
        end_date: new Date().toISOString(),
        limit: 50,
      },
    });

    const mpPayments = searchResults.results || [];
    if (mpPayments.length === 0) return;

    // 3. Operación en Bloque (Optimización 3)
    // Extraer IDs y verificar existencia en UNA sola consulta a DB
    const mpIds = mpPayments
      .map(p => p.id?.toString())
      .filter((id): id is string => !!id);
    
    // Verificamos en suscripciones y órdenes (usando mpPaymentId o mpSubscriptionId según corresponda)
    const [existingSubs, existingOrders] = await Promise.all([
      this.prisma.subscription.findMany({
        where: { mpSubscriptionId: { in: mpIds } },
        select: { mpSubscriptionId: true }
      }),
      this.prisma.order.findMany({
        where: { mpPaymentId: { in: mpIds } },
        select: { mpPaymentId: true }
      })
    ]);

    const existingSet = new Set([
      ...existingSubs.map(s => s.mpSubscriptionId),
      ...existingOrders.map(o => o.mpPaymentId)
    ]);

    const missingPayments = mpPayments.filter(p => {
      const idStr = p.id?.toString();
      return idStr !== undefined && !existingSet.has(idStr);
    });

    for (const payment of missingPayments) {
      const paymentId = payment.id?.toString();
      if (!paymentId) continue;

      try {
        await this.paymentsService.syncPaymentById(paymentId, tenantId);
        await this.notifyRecovery(paymentId, tenantId);
      } catch (error) {
        this.logger.error(`Recovery failed for payment ${paymentId}: ${error.message}`);
      }
    }
  }

  private async acquireLock(): Promise<boolean> {
    const now = new Date();
    try {
      // Intentar crear el lock. Si ya existe y no ha expirado, fallará por clave única.
      await this.prisma.jobLock.upsert({
        where: { id: this.LOCK_ID },
        update: {
          // Solo actualizamos si el anterior expiró
          lockedAt: now,
          expiresAt: new Date(now.getTime() + this.LOCK_DURATION_MS),
        },
        create: {
          id: this.LOCK_ID,
          expiresAt: new Date(now.getTime() + this.LOCK_DURATION_MS),
        },
      });
      
      // Verificación adicional de expiración en caso de que el upsert no sea suficiente (lógica atómica manual)
      const lock = await this.prisma.jobLock.findUnique({ where: { id: this.LOCK_ID } });
      if (lock && lock.expiresAt > now && lock.lockedAt.getTime() !== now.getTime()) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  private async releaseLock() {
    try {
      await this.prisma.jobLock.delete({ where: { id: this.LOCK_ID } });
    } catch {
      // Ignorar si ya fue borrado
    }
  }

  private async notifyRecovery(paymentId: string, tenantId: string) {
    // 4. Notificaciones (Optimización 4)
    this.logger.warn(`[ALERTA] Worker recuperó pago huérfano: ${paymentId} para tenant ${tenantId}`);
    
    const webhookUrl = process.env.TECH_ALERTS_WEBHOOK;
    if (webhookUrl) {
      try {
        await axios.post(webhookUrl, {
          text: `🚨 *Alerta de Conciliación*\nEl worker recuperó un pago que no llegó vía Webhook.\n*Pago ID:* ${paymentId}\n*Tenant:* ${tenantId}\n*Acción:* Activado automáticamente.`
        });
      } catch (e) {
        this.logger.error(`Failed to send tech alert: ${e.message}`);
      }
    }
  }
}
