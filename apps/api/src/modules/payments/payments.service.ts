import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  Scope,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { StorageService } from '../storage/storage.service';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import * as crypto from 'crypto';
import type { Request } from 'express';
import { CreateCheckoutDto } from './dto';

@Injectable({ scope: Scope.REQUEST })
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private mp: MercadoPagoConfig | null = null;
  private preference: Preference | null = null;
  private paymentClient: Payment | null = null;

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private prisma: PrismaService,
    private config: ConfigService,
    private emailService: EmailService,
    private storageService: StorageService,
  ) {
    // Initialization moved to async method
  }

  private getTenantId(): string {
    return (
      (this.request as any).tenantId ||
      (this.request.headers['x-tenant-id'] as string) ||
      (this.request.query['tenantId'] as string) ||
      'default'
    );
  }

  private async getMercadoPagoConfig() {
    try {
      const setting = await this.prisma.secure.systemSetting.findFirst({
        where: { tenantId: this.getTenantId(), key: 'MERCADOPAGO_CONFIG' },
      });

      if (!setting || !setting.value) {
        this.logger.error('MERCADOPAGO_CONFIG not found in DB');
        throw new InternalServerErrorException('Payment configuration missing');
      }

      const config =
        typeof setting.value === 'string'
          ? JSON.parse(setting.value)
          : setting.value;

      // Validar que tenga lo necesario
      if (!config.accessToken || !config.publicKey) {
        this.logger.error('Invalid MERCADOPAGO_CONFIG structure');
        throw new InternalServerErrorException('Invalid payment configuration');
      }

      return config;
    } catch (error) {
      this.logger.error('Error fetching Mercado Pago config', error);
      throw new InternalServerErrorException(
        'Could not load payment configuration',
      );
    }
  }

  private async getTenantCurrency(): Promise<string> {
    try {
      const setting = await this.prisma.secure.systemSetting.findFirst({
        where: { tenantId: this.getTenantId(), key: 'TENANT_CONFIG' },
      });

      if (!setting || !setting.value) {
        this.logger.warn('TENANT_CONFIG not found, using default currency COP');
        return 'COP';
      }

      const config =
        typeof setting.value === 'string'
          ? JSON.parse(setting.value)
          : setting.value;

      return config.currency || 'COP';
    } catch (error) {
      this.logger.error('Error fetching tenant currency', error);
      return 'COP'; // Fallback
    }
  }

  private async initMercadoPago() {
    if (this.mp) return; // Ya inicializado

    const config = await this.getMercadoPagoConfig();
    this.mp = new MercadoPagoConfig({ accessToken: config.accessToken });
    this.preference = new Preference(this.mp);
    this.paymentClient = new Payment(this.mp);

    return config; // Retornamos config por si necesitamos webhookSecret u otros
  }

  async verifyWebhookSignature(
    xSignature: string,
    xRequestId: string,
    dataId: string,
  ): Promise<boolean> {
    let secret = '';
    try {
      const config = await this.getMercadoPagoConfig();
      secret = config.webhookSecret;
    } catch (e) {
      this.logger.warn('Could not load MP config for signature verification');
    }

    if (!secret) {
      // Fallback to env or allow if logic dictates (User requirement: eliminate env, but keep robustness)
      secret = this.config.get<string>('MP_WEBHOOK_SECRET') || '';
    }

    if (!secret) {
      this.logger.warn(
        'MP_WEBHOOK_SECRET not configured (DB or Env). Skipping signature verification.',
      );
      return true;
    }

    if (!xSignature || !xRequestId || !dataId) {
      return false;
    }

    try {
      // x-signature format: ts=...;v1=...
      const parts = xSignature.split(';');
      let ts = '';
      let v1 = '';

      parts.forEach((part) => {
        const [key, value] = part.split('=');
        if (key === 'ts') ts = value;
        if (key === 'v1') v1 = value;
      });

      const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(manifest);
      const sha = hmac.digest('hex');

      return sha === v1;
    } catch (error) {
      this.logger.error('Error verifying signature', error);
      return false;
    }
  }

  // ==================== SUBSCRIPTIONS ====================

  async createSubscriptionCheckout(
    userId: string,
    email?: string,
    frontUrl?: string,
  ) {
    await this.initMercadoPago();

    if (!this.preference) {
      throw new BadRequestException('Mercado Pago no está configurado');
    }

    const user = await this.prisma.secure.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Si ya tiene suscripción activa, no permitir crear otra
    if (user.subscription?.status === 'ACTIVE') {
      throw new BadRequestException('Ya tienes una suscripción activa');
    }

    const frontendUrl =
      frontUrl ||
      this.config.get<string>('FRONTEND_URL') ||
      'http://localhost:3000';
    const subscriptionPrice = 15; // USD - Precio mensual
    const currency = await this.getTenantCurrency();

    // Crear preferencia de pago en Mercado Pago
    const preferenceData = {
      items: [
        {
          id: 'subscription-monthly',
          title: 'Suscripción Premium - Mauro Mera',
          description:
            'Acceso completo a todos los cursos, contenido premium y evaluaciones',
          quantity: 1,
          unit_price: subscriptionPrice,
          currency_id: currency,
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
      notification_url: `${this.config.get('API_URL') || 'http://localhost:3001'}/api/payments/webhook?tenantId=${this.getTenantId()}`,
      external_reference: userId,
      metadata: {
        userId,
        type: 'subscription',
      },
    };

    try {
      const response = await this.preference.create({ body: preferenceData });

      // Crear o actualizar registro de suscripción como pendiente
      await this.prisma.secure.subscription.upsert({
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
    const subscription = await this.prisma.secure.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('No tienes una suscripción');
    }

    if (subscription.status !== 'ACTIVE') {
      throw new BadRequestException('La suscripción ya está cancelada');
    }

    // Actualizar estado a CANCELLED
    await this.prisma.secure.subscription.update({
      where: { userId },
      data: { status: 'CANCELLED' },
    });

    return { message: 'Suscripción cancelada correctamente' };
  }

  async getSubscriptionStatus(userId: string) {
    const subscription = await this.prisma.secure.subscription.findUnique({
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

  // ==================== PRODUCT PURCHASES ====================

  async createProductCheckout(dto: CreateCheckoutDto, tenantId: string) {
    // 2. Credenciales Multi-tenant
    const setting = await this.prisma.secure.systemSetting.findFirst({
      where: { tenantId, key: 'MERCADOPAGO_CONFIG' },
    });

    if (!setting || !setting.value) {
      throw new BadRequestException(
        'El vendedor no ha configurado MercadoPago',
      );
    }

    const config =
      typeof setting.value === 'string'
        ? JSON.parse(setting.value)
        : setting.value;
    const accessToken = config.accessToken;

    if (!accessToken) {
      throw new BadRequestException(
        'El vendedor no ha configurado MercadoPago',
      );
    }

    // 3. Instanciación Dinámica (Aislado por Request Multi-tenant)
    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const frontendUrl =
      dto.frontUrl ||
      this.config.get<string>('FRONTEND_URL') ||
      'http://localhost:3000';
    const currency = await this.getTenantCurrency();

    // 1. Seguridad de Precios / Fetch Variants
    const preferenceItems: any[] = [];
    let totalAmount = 0;

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    // Batch fetch: single query replaces N findUnique calls
    const variantIds = dto.items.map((i) => i.variantId);
    const variants = await this.prisma.secure.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    for (const item of dto.items) {
      const variant = variantMap.get(item.variantId);

      if (!variant)
        throw new NotFoundException(
          `Variante no encontrada: ${item.variantId}`,
        );
      if (!variant.product.published)
        throw new BadRequestException(
          `Producto no disponible: ${variant.product.name}`,
        );

      const price = Number(variant.price);
      totalAmount += price * item.quantity;

      preferenceItems.push({
        id: variant.id,
        title: variant.product.name,
        description: variant.name !== 'Standard' ? variant.name : undefined,
        quantity: item.quantity,
        unit_price: price,
        currency_id: currency,
        picture_url:
          variant.product.images?.[0] || variant.product.digitalFileUrl,
      });
    }

    // 4. Creación de Preferencia (Metadata Crítico)
    const metadata = {
      tenant_id: tenantId, // MercadoPago prefiere snake_case en custom objects a veces o strings simples
      type: 'order',
      items_json: JSON.stringify(dto.items),
      customer_name: dto.customer?.name || '',
      customer_email: dto.customer?.email || '',
      customer_phone: dto.customer?.phone || '',
      user_id: dto.customer?.userId || '',
      address: dto.customer?.address || '',
      city: dto.customer?.city || '',
      lat: dto.customer?.lat?.toString() || '',
      lng: dto.customer?.lng?.toString() || '',
    };

    const apiUrl =
      this.config.get<string>('API_PUBLIC_URL') ||
      this.config.get<string>('API_URL') ||
      'http://localhost:3001';
    const notificationUrl = `${apiUrl}/api/payments/webhook`;

    const preferenceData = {
      items: preferenceItems,
      payer: {
        name: dto.customer?.name,
        email: dto.customer?.email,
      },
      back_urls: {
        success: `${frontendUrl}/checkout/success`,
        failure: `${frontendUrl}/checkout/failure`,
        pending: `${frontendUrl}/checkout/pending`,
      },
      auto_return: 'approved' as const,
      notification_url: notificationUrl,
      metadata,
    };

    try {
      const response = await preference.create({ body: preferenceData });
      return {
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point,
        preferenceId: response.id,
        totalAmount,
      };
    } catch (error) {
      this.logger.error(
        'Error creating product preference via MercadoPago',
        error,
      );
      throw new BadRequestException('Error al iniciar el pago con MercadoPago');
    }
  }

  // ==================== WEBHOOKS ====================

  async handleWebhook(type: string, dataId: string) {
    this.logger.log(`Webhook received: type=${type}, data.id=${dataId}`);

    if (type !== 'payment') {
      return { status: 'ignored', reason: 'not a payment notification' };
    }

    return this.processWebhook(dataId);
  }

  private async processWebhook(dataId: string) {
    // En este punto aún no sabemos el tenantId seguro.
    // 1. Debemos hacer un fetch global a todas las configs o iterar si no tenemos el tenantId a priori.
    // Dado que MercadoPago envía la notificación globalmente, a menos que el webhook URL tenga ?tenantId=...
    // Aquí asumimos que el Request inicial lo trajo, PERO si no lo trae, buscaremos el tenant iterativamente o de la metadata si logramos desencriptar.

    // Estrategia segura: Instanciar MP "a ciegas" aquí es imposible sin accessToken.
    // PERO si el controlador forzó la inyección de tenantId via query param (ej: /webhook?tenantId=xxx),
    // this.getTenantId() funcionará. Si no, tenemos un problema de diseño en MP oauth vs access_token.
    // Asumiendo que tenantId viene por URL query (`this.getTenantId()`) o fue inyectado por el interceptor:

    const tenantId = this.getTenantId();

    if (tenantId === 'default' && !this.request.query['tenantId']) {
      this.logger.error(
        `Webhook rejected: Unable to determine tenant for data.id=${dataId}`,
      );
      return { status: 'error', reason: 'tenant not identified in webhook' };
    }

    const resolvedTenantId =
      tenantId !== 'default'
        ? tenantId
        : (this.request.query['tenantId'] as string);

    try {
      // 1. Recuperar Credenciales
      const setting = await this.prisma.secure.systemSetting.findFirst({
        where: { tenantId: resolvedTenantId, key: 'MERCADOPAGO_CONFIG' },
      });

      if (!setting || !setting.value) {
        return {
          status: 'error',
          reason: 'Mercado Pago configuration missing',
        };
      }

      const config =
        typeof setting.value === 'string'
          ? JSON.parse(setting.value)
          : setting.value;
      const accessToken = config.accessToken;

      if (!accessToken) {
        return { status: 'error', reason: 'Mercado Pago not configured' };
      }

      // 2. Consultar la Fuente de Verdad (MP API)
      const client = new MercadoPagoConfig({ accessToken });
      const paymentClient = new Payment(client);

      const paymentData = await paymentClient.get({ id: dataId });

      if (!paymentData) {
        this.logger.warn(`Payment ${dataId} not found`);
        return { status: 'error', reason: 'payment not found' };
      }

      const status = paymentData.status;
      const metadata = paymentData.metadata;

      this.logger.log(
        `Payment status: ${status}, metadata_type: ${metadata?.type}`,
      );

      // 3. Verificar Estado
      if (status === 'approved') {
        const paymentType = metadata?.type;

        if (paymentType === 'subscription') {
          // Logica de suscripcion (Legacy/Original)
          const userId = metadata?.userId;
          if (userId) {
            await this.activateSubscription(
              userId,
              dataId,
              paymentData.payer?.id?.toString(),
            );
          }
        } else if (paymentType === 'order') {
          // 4. Extraer Metadata
          const itemsJson = metadata.items_json;
          const customerEmail = metadata.customer_email;
          const customerName = metadata.customer_name;
          const customerPhone = metadata.customer_phone;
          const metaTenantId = metadata.tenant_id;
          const address = metadata.address;
          const city = metadata.city;
          const lat = metadata.lat ? parseFloat(metadata.lat) : undefined;
          const lng = metadata.lng ? parseFloat(metadata.lng) : undefined;

          // Anti-IDOR / Spoofing check
          if (metaTenantId !== resolvedTenantId) {
            this.logger.error(
              `Tenant mismatch in webhook. Expected ${resolvedTenantId}, got ${metaTenantId}`,
            );
            return {
              status: 'error',
              reason: 'tenant mismatch security error',
            };
          }

          let items: any[] = [];
          try {
            items =
              typeof itemsJson === 'string' ? JSON.parse(itemsJson) : itemsJson;
          } catch (e) {
            this.logger.error('Failed to parse items_json from MP metadata', e);
          }

          // Avoid duplicate processing by checking if an Order with this mpPaymentId already exists
          const existingOrder = await this.prisma.secure.order.findFirst({
            where: { mpPaymentId: dataId, tenantId: resolvedTenantId },
          });

          if (existingOrder) {
            this.logger.log(`Order for payment ${dataId} already processed.`);
            return { status: 'processed' };
          }

          // 5. Creación de la Orden (Prisma Transaction)
          await this.prisma.$transaction(async (tx) => {
            let totalAmount = 0;
            const orderItemsData: any[] = [];
            const digitalItemsDispatch: any[] = [];

            for (const item of items) {
              const variant = await tx.productVariant.findUnique({
                where: { id: item.variantId },
                include: { product: true },
              });

              if (!variant) continue;

              const price = Number(variant.price);
              totalAmount += price * item.quantity;

              orderItemsData.push({
                variantId: variant.id,
                quantity: item.quantity,
                price: price,
                productName: variant.product.name,
                variantName: variant.name !== 'Standard' ? variant.name : null,
                isPaid: true,
              });

              if (variant.product.productType === 'DIGITAL') {
                digitalItemsDispatch.push(variant.product);
              }
            }

            if (orderItemsData.length === 0) {
              throw new Error('No valid items found for order');
            }

            // Generar numero de orden
            const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`;

            const newOrder = await tx.order.create({
              data: {
                tenantId: resolvedTenantId,
                orderNumber,
                totalAmount,
                status: 'APPROVED',
                orderType: 'DELIVERY', // o 'DINE_IN' según modelo, asumiendo e-commerce
                mpPaymentId: dataId,
                customerName,
                customerPhone,
                notes: customerEmail ? `Email: ${customerEmail}` : '',
                shippingData: address ? {
                  address,
                  city,
                  lat,
                  lng
                } : undefined,
                items: {
                  create: orderItemsData,
                },
              },
            });

            this.logger.log(
              `Order ${newOrder.orderNumber} created successfully via Webhook`,
            );

            // 6. Despacho Digital (Lógica)
            if (digitalItemsDispatch.length > 0 && customerEmail) {
              this.logger.log(
                `Dispatching ${digitalItemsDispatch.length} digital items to ${customerEmail}`,
              );

              const dispatchLinks: {
                productName: string;
                downloadUrl: string;
              }[] = [];

              for (const product of digitalItemsDispatch) {
                if (product.digitalFileUrl) {
                  try {
                    // Generar Pre-Signed URL con 24 horas de validez (86400 segundos)
                    const downloadUrl =
                      await this.storageService.getPresignedUrl(
                        product.digitalFileUrl,
                        86400,
                      );
                    dispatchLinks.push({
                      productName: product.name,
                      downloadUrl,
                    });
                  } catch (err) {
                    this.logger.error(
                      `Error generating presigned URL for ${product.name}`,
                      err,
                    );
                  }
                }
              }

              if (dispatchLinks.length > 0) {
                // Ejecutar envío de email SIN await dentro del transaction.
                // Usamos un `.catch` para no bloquear el Event Loop ni revertir el commit de Prisma si falla el SMTP.
                this.emailService
                  .sendDigitalDelivery(
                    customerEmail,
                    customerName || 'Cliente',
                    dispatchLinks,
                  )
                  .then((success) => {
                    if (success) {
                      this.logger.log(
                        `Digital delivery email sent to ${customerEmail}`,
                      );
                    } else {
                      this.logger.error(
                        `Failed to send digital delivery email to ${customerEmail}`,
                      );
                    }
                  })
                  .catch((e) => {
                    this.logger.error(
                      `Unhandled error sending digital delivery email to ${customerEmail}`,
                      e,
                    );
                  });
              }
            }
          });
        }
      }

      return { status: 'processed' };
    } catch (error) {
      this.logger.error('Error processing webhook', error);
      return { status: 'error', reason: 'processing failed' };
    }
  }

  private async activateSubscription(
    userId: string,
    mpPaymentId: string,
    mpPayerId?: string,
  ) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 mes de suscripción

    await this.prisma.secure.subscription.upsert({
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

    // Send confirmation email (non-blocking - don't fail if email fails)
    try {
      const user = await this.prisma.secure.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (user) {
        await this.emailService.sendSubscriptionSuccessEmail(
          user.email,
          user.name || 'Usuario',
          'Suscripción Premium Mensual',
          endDate,
        );
      }
    } catch (emailError) {
      this.logger.error('Error sending subscription email:', emailError);
      // Continue - don't fail the transaction if email fails
    }
  }

  private async approveOrder(orderId: string, mpPaymentId: string) {
    // 1. Update Order Status
    const tenantId = this.getTenantId();
    const order = await this.prisma.secure.order.findUnique({
      where: { id: orderId }, // Si tienes @@unique compuesto, asegúrate de ajustarlo aquí (ej. tenantId_id)
      include: { user: true, items: true },
    });

    // Anti-IDOR Check: Validar que la orden pertenece al tenant
    if (order && order.tenantId !== tenantId) {
      this.logger.error(
        `Security Breach Attempt: Order ${orderId} does not belong to tenant ${tenantId}`,
      );
      return;
    }

    if (!order || order.status === 'APPROVED' || order.status === 'DELIVERED') {
      this.logger.warn(`Order ${orderId} already approved or not found.`);
      return;
    }

    await this.prisma.secure.order.update({
      where: { id: orderId }, // Asume que ID es primary key aislada, el check previo protege el Row-Level
      data: {
        status: 'APPROVED',
        mpPaymentId,
      },
    });

    this.logger.log(`Order ${orderId} approved.`);

    // 2. Reduce Stock (if physical/tracked)
    // Note: For now we are focusing on digital flow, but good to add TODO for stock management
    // await this.reduceStock(order.items);

    // 3. Send Confirmation Email
    try {
      // We can send a generic summary email, or 1 email per digital item if needed.
      // For now, let's send 1 email per digital item to match legacy behavior, or a new summary email.
      // Let's stick to the plan: DigitalPurchaseEmail (generic).

      // If order has multiple digital items, we might spam user. Ideally create OrderConfirmationEmail.
      // But to minimize scope creep, let's send DigitalPurchaseEmail for the first item found or loop.
      // Let's loop for now to ensure delivery of all links.

      // Batch fetch: single query replaces N findUnique calls
      const variantIds = order.items.map((i) => i.variantId);
      const variants = await this.prisma.secure.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: true },
      });
      const variantMap = new Map(variants.map((v) => [v.id, v]));

      for (const item of order.items) {
        const variant = variantMap.get(item.variantId);

        if (variant && variant.product.productType === 'DIGITAL') {
          if (order.user?.email) {
            await this.emailService.sendDigitalPurchaseEmail(
              order.user.email,
              order.user.name || order.customerName || 'Cliente',
              item.productName,
              variant.product.slug,
            );
          } else {
            this.logger.warn(
              `No se pudo enviar email digital para la orden ${orderId}: No hay email disponible.`,
            );
          }
        }
      }
    } catch (e) {
      this.logger.error(`Error sending order email for ${orderId}`, e);
    }
  }

  // Admin: Assign manual subscription
  async assignManualSubscription(userId: string, days = 30) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    await this.prisma.secure.subscription.upsert({
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

    this.logger.log(
      `Manual subscription assigned to user ${userId} for ${days} days`,
    );
    return { message: 'Suscripción asignada correctamente' };
  }

  // ==================== USER SUBSCRIPTION CHECK ====================

  async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await this.prisma.secure.subscription.findUnique({
      where: { userId },
    });
    return subscription?.status === 'ACTIVE';
  }

  // ==================== ADMIN ====================

  async getPaymentStats() {
    const [activeSubscriptions, totalEbookPurchases, pendingSubscriptions] =
      await Promise.all([
        this.prisma.secure.subscription.count({ where: { status: 'ACTIVE' } }),
        this.prisma.secure.purchase.count({ where: { status: 'approved' } }),
        this.prisma.secure.subscription.count({ where: { status: 'PENDING' } }),
      ]);

    const recentSubscriptions = await this.prisma.secure.subscription.findMany({
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
