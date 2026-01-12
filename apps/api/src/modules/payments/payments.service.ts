import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private mp: MercadoPagoConfig | null = null;
    private preference: Preference | null = null;
    private paymentClient: Payment | null = null;

    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
    ) {
        const accessToken = this.config.get<string>('MP_ACCESS_TOKEN');
        if (accessToken) {
            this.mp = new MercadoPagoConfig({ accessToken });
            this.preference = new Preference(this.mp);
            this.paymentClient = new Payment(this.mp);
        }
    }

    // ==================== SUBSCRIPTIONS ====================

    async createSubscriptionCheckout(userId: string, email?: string, frontUrl?: string) {
        if (!this.preference) {
            throw new BadRequestException('Mercado Pago no está configurado');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
        });

        if (!user) throw new NotFoundException('Usuario no encontrado');

        // Si ya tiene suscripción activa, no permitir crear otra
        if (user.subscription?.status === 'ACTIVE') {
            throw new BadRequestException('Ya tienes una suscripción activa');
        }

        const frontendUrl = frontUrl || this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const subscriptionPrice = 15; // USD - Precio mensual

        // Crear preferencia de pago en Mercado Pago
        const preferenceData = {
            items: [
                {
                    id: 'subscription-monthly',
                    title: 'Suscripción Premium - Mauro Mera',
                    description: 'Acceso completo a todos los cursos, contenido premium y evaluaciones',
                    quantity: 1,
                    unit_price: subscriptionPrice,
                    currency_id: 'USD',
                },
            ],
            payer: {
                email: email || user.email,
            },
            back_urls: {
                success: `${frontendUrl}/suscripcion/exito`,
                failure: `${frontendUrl}/suscripcion/error`,
                pending: `${frontendUrl}/suscripcion/pendiente`,
            },
            auto_return: 'approved' as const,
            notification_url: `${this.config.get('API_URL') || 'http://localhost:3001'}/api/payments/webhook`,
            external_reference: userId,
            metadata: {
                userId,
                type: 'subscription',
            },
        };

        try {
            const response = await this.preference.create({ body: preferenceData });

            // Crear o actualizar registro de suscripción como pendiente
            await this.prisma.subscription.upsert({
                where: { userId },
                create: {
                    userId,
                    status: 'PENDING',
                },
                update: {
                    status: 'PENDING',
                },
            });

            return {
                preferenceId: response.id,
                initPoint: response.init_point,
                sandboxInitPoint: response.sandbox_init_point,
            };
        } catch (error) {
            this.logger.error('Error creating subscription preference', error);
            throw new BadRequestException('Error al crear la preferencia de pago');
        }
    }

    async cancelSubscription(userId: string) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });

        if (!subscription) {
            throw new NotFoundException('No tienes una suscripción');
        }

        if (subscription.status !== 'ACTIVE') {
            throw new BadRequestException('La suscripción ya está cancelada');
        }

        // Actualizar estado a CANCELLED
        await this.prisma.subscription.update({
            where: { userId },
            data: { status: 'CANCELLED' },
        });

        return { message: 'Suscripción cancelada correctamente' };
    }

    async getSubscriptionStatus(userId: string) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });

        if (!subscription) {
            return { hasSubscription: false, status: null };
        }

        return {
            hasSubscription: true,
            status: subscription.status,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
        };
    }

    // ==================== EBOOK PURCHASES ====================

    async createEbookPurchaseCheckout(userId: string, ebookId: string, email?: string, frontUrl?: string) {
        if (!this.preference) {
            throw new BadRequestException('Mercado Pago no está configurado');
        }

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('Usuario no encontrado');

        const ebook = await this.prisma.ebook.findUnique({ where: { id: ebookId } });
        if (!ebook) throw new NotFoundException('E-book no encontrado');

        // Verificar si ya lo compró
        const existingPurchase = await this.prisma.purchase.findUnique({
            where: { userId_ebookId: { userId, ebookId } },
        });

        if (existingPurchase && existingPurchase.status === 'approved') {
            throw new BadRequestException('Ya has comprado este e-book');
        }

        const frontendUrl = frontUrl || this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';

        const preferenceData = {
            items: [
                {
                    id: `ebook-${ebookId}`,
                    title: ebook.title,
                    description: ebook.description.substring(0, 255),
                    quantity: 1,
                    unit_price: Number(ebook.price), // Convert Decimal to number
                    currency_id: 'COP',
                },
            ],
            payer: {
                email: email || user.email,
            },
            back_urls: {
                success: `${frontendUrl}/ebooks/${ebook.slug}/exito`,
                failure: `${frontendUrl}/ebooks/${ebook.slug}/error`,
                pending: `${frontendUrl}/ebooks/${ebook.slug}/pendiente`,
            },
            auto_return: 'approved' as const,
            notification_url: `${this.config.get('API_URL') || 'http://localhost:3001'}/api/payments/webhook`,
            external_reference: `${userId}|${ebookId}`,
            metadata: {
                userId,
                ebookId,
                type: 'ebook',
            },
        };

        try {
            const response = await this.preference.create({ body: preferenceData });

            return {
                preferenceId: response.id,
                initPoint: response.init_point,
                sandboxInitPoint: response.sandbox_init_point,
            };
        } catch (error) {
            this.logger.error('Error creating ebook purchase preference', error);
            throw new BadRequestException('Error al crear la preferencia de pago');
        }
    }

    // ==================== WEBHOOKS ====================

    async handleWebhook(type: string, dataId: string) {
        this.logger.log(`Webhook received: type=${type}, data.id=${dataId}`);

        if (type !== 'payment') {
            return { status: 'ignored', reason: 'not a payment notification' };
        }

        if (!this.paymentClient) {
            return { status: 'error', reason: 'Mercado Pago not configured' };
        }

        try {
            // Obtener detalles del pago
            const paymentData = await this.paymentClient.get({ id: dataId });
            const payment = paymentData;

            if (!payment) {
                this.logger.warn(`Payment ${dataId} not found`);
                return { status: 'error', reason: 'payment not found' };
            }

            const status = payment.status;
            const externalRef = payment.external_reference;
            const metadata = payment.metadata as Record<string, string> | undefined;

            this.logger.log(`Payment status: ${status}, external_reference: ${externalRef}`);

            // Procesar según el estado del pago
            if (status === 'approved') {
                const paymentType = metadata?.type;

                if (paymentType === 'subscription' || (externalRef && !externalRef.includes('|'))) {
                    // Es una suscripción
                    const userId = externalRef || metadata?.userId;
                    if (userId) {
                        await this.activateSubscription(userId, dataId, payment.payer?.id?.toString());
                    }
                } else if (paymentType === 'ebook' || (externalRef && externalRef.includes('|'))) {
                    // Es una compra de ebook
                    const [userId, ebookId] = (externalRef || '').split('|');
                    if (userId && ebookId) {
                        await this.completeEbookPurchase(userId, ebookId, dataId, Number(payment.transaction_amount) || 0);
                    }
                }
            }

            return { status: 'processed' };
        } catch (error) {
            this.logger.error('Error processing webhook', error);
            return { status: 'error', reason: 'processing failed' };
        }
    }

    private async activateSubscription(userId: string, mpPaymentId: string, mpPayerId?: string) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // 1 mes de suscripción

        await this.prisma.subscription.upsert({
            where: { userId },
            create: {
                userId,
                status: 'ACTIVE',
                mpSubscriptionId: mpPaymentId,
                mpPayerId: mpPayerId,
                startDate,
                endDate,
            },
            update: {
                status: 'ACTIVE',
                mpSubscriptionId: mpPaymentId,
                mpPayerId: mpPayerId,
                startDate,
                endDate,
            },
        });

        this.logger.log(`Subscription activated for user ${userId}`);
    }

    // Admin: Assign manual subscription
    async assignManualSubscription(userId: string, months = 1) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + months);

        await this.prisma.subscription.upsert({
            where: { userId },
            create: {
                userId,
                status: 'ACTIVE',
                mpSubscriptionId: 'MANUAL_ASSIGNMENT',
                startDate,
                endDate,
            },
            update: {
                status: 'ACTIVE',
                mpSubscriptionId: 'MANUAL_ASSIGNMENT',
                startDate,
                endDate,
            },
        });

        this.logger.log(`Manual subscription assigned to user ${userId} for ${months} months`);
        return { message: 'Suscripción asignada correctamente' };
    }

    private async completeEbookPurchase(userId: string, ebookId: string, mpPaymentId: string, amount: number) {
        await this.prisma.purchase.upsert({
            where: { userId_ebookId: { userId, ebookId } },
            create: {
                userId,
                ebookId,
                mpPaymentId,
                amount,
                status: 'approved',
            },
            update: {
                mpPaymentId,
                status: 'approved',
            },
        });

        this.logger.log(`Ebook purchase completed: user=${userId}, ebook=${ebookId}`);
    }

    // ==================== USER SUBSCRIPTION CHECK ====================

    async hasActiveSubscription(userId: string): Promise<boolean> {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });
        return subscription?.status === 'ACTIVE';
    }

    // ==================== ADMIN ====================

    async getPaymentStats() {
        const [activeSubscriptions, totalEbookPurchases, pendingSubscriptions] = await Promise.all([
            this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
            this.prisma.purchase.count({ where: { status: 'approved' } }),
            this.prisma.subscription.count({ where: { status: 'PENDING' } }),
        ]);

        const recentSubscriptions = await this.prisma.subscription.findMany({
            where: { status: 'ACTIVE' },
            take: 10,
            orderBy: { startDate: 'desc' },
            include: { user: { select: { email: true, name: true } } },
        });

        return {
            activeSubscriptions,
            totalEbookPurchases,
            pendingSubscriptions,
            recentSubscriptions,
        };
    }
}
