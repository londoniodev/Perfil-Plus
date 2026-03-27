import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  Scope,
  InternalServerErrorException,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { StorageService } from '../storage/storage.service';
import { BoldService } from './bold.service';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import * as crypto from 'crypto';
import type { Request } from 'express';
import { CreateCheckoutDto } from './dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private mp: MercadoPagoConfig | null = null;
  private preference: Preference | null = null;
  private paymentClient: Payment | null = null;

  constructor(
    private cls: ClsService,
    private prisma: PrismaService,
    private config: ConfigService,
    private emailService: EmailService,
    private storageService: StorageService,
    private boldService: BoldService,
  ) {
    // Initialization moved to async method
  }

  private getTenantId(): string {
    return this.cls.get('tenantId') || 'default';
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
      this.logger.error(
        'MP_WEBHOOK_SECRET not configured (DB or Env). Rejecting webhook for security.',
      );
      return false;
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
      notification_url: `${this.config.get('API_PUBLIC_URL') || this.config.get('API_URL') || 'http://localhost:3001'}/api/payments/webhook?tenantId=${this.getTenantId()}`,
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
    const storeSettings = await (
      this.prisma.secure as any
    ).storeSettings.findFirst({
      where: { tenantId },
    });

    const activeProvider = storeSettings?.activePaymentProvider || 'NONE';

    if (activeProvider === 'NONE') {
      throw new BadRequestException('El vendedor no ha configurado pagos');
    }

    const frontendUrl =
      dto.frontUrl ||
      this.config.get<string>('FRONTEND_URL') ||
      'http://localhost:3000';
    const currency = await this.getTenantCurrency();

    // 1. Calcular Montos y Preparar Items
    const preferenceItems: any[] = [];
    let totalAmount = 0;
    const orderItemsData: any[] = [];

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    const variantIds = dto.items.map((i) => i.variantId);
    const variants = await this.prisma.secure.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    const modifierIds = dto.items.flatMap(
      (i) => i.modifiers?.map((m) => m.modifierId) || [],
    );
    const modifiers =
      modifierIds.length > 0
        ? await this.prisma.secure.modifier.findMany({
            where: { id: { in: modifierIds } },
          })
        : [];
    const modifierMap = new Map(modifiers.map((m) => [m.id, m]));

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

      let unitPrice = Number(variant.price);
      let description = variant.name !== 'Standard' ? variant.name : '';
      const itemModifiersData: any[] = [];

      if (item.modifiers && item.modifiers.length > 0) {
        const modDescriptions: string[] = [];
        for (const modItem of item.modifiers) {
          const mod = modifierMap.get(modItem.modifierId);
          if (mod) {
            unitPrice += Number(mod.priceAdjustment) * modItem.quantity;
            modDescriptions.push(`${mod.name} (x${modItem.quantity})`);
            itemModifiersData.push({
              modifierId: mod.id,
              modifierName: mod.name,
              priceAdjustment: mod.priceAdjustment,
              quantity: modItem.quantity,
            });
          }
        }
        if (modDescriptions.length > 0) {
          description = description
            ? `${description} - ${modDescriptions.join(', ')}`
            : modDescriptions.join(', ');
        }
      }

      totalAmount += unitPrice * item.quantity;

      preferenceItems.push({
        id: variant.id,
        title: variant.product.name,
        description: description || undefined,
        quantity: item.quantity,
        unit_price: unitPrice,
        currency_id: currency,
        picture_url:
          variant.product.images?.[0] || variant.product.digitalFileUrl,
      });

      orderItemsData.push({
        variantId: variant.id,
        quantity: item.quantity,
        price: unitPrice,
        productName: variant.product.name,
        variantName: variant.name !== 'Standard' ? variant.name : null,
        isPaid: false, // se actualizará en webhook si aplica
        modifiers: {
          create: itemModifiersData,
        },
      });
    }

    const apiUrl =
      this.config.get<string>('API_PUBLIC_URL') ||
      this.config.get<string>('API_URL') ||
      'http://localhost:3001';

    // Para Cash y Bold, es conveniente crear la orden anticipadamente (estado PENDING).
    // Si la orden ya existiera proveniente del DTO:
    let orderIdToUse = dto.existingOrderId;

    if (
      !orderIdToUse &&
      (activeProvider === 'BOLD' || activeProvider === 'CASH')
    ) {
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`;
      const newOrder = await this.prisma.secure.order.create({
        data: {
          tenantId,
          orderNumber,
          totalAmount,
          status: 'PENDING',
          orderType: 'DELIVERY', // o según lógica del negocio
          paymentProvider: activeProvider,
          customerName: dto.customer?.name,
          customerPhone: dto.customer?.phone,
          customerEmail: dto.customer?.email,
          identification: dto.customer?.identification,
          notes: (() => {
            let methodLabel = dto.paymentMethod || activeProvider;
            if (methodLabel === 'CASH') methodLabel = 'Efectivo';
            if (methodLabel === 'MERCADOPAGO' || methodLabel === 'MERCADO_PAGO')
              methodLabel = 'MercadoPago';
            if (methodLabel === 'BOLD') methodLabel = 'Bold';
            if (methodLabel === 'BOLD_NEQUI') methodLabel = 'Bold (Nequi)';
            if (methodLabel === 'BOLD_DAVIPLATA')
              methodLabel = 'Bold (Daviplata)';
            if (
              methodLabel === 'BOLD_POS' ||
              methodLabel === 'BOLD_PAY_BY_LINK'
            )
              methodLabel = 'Bold (Tarjeta/PSE)';

            const paymentNote = `Forma de pago: ${methodLabel}`;
            return dto.customer?.notes
              ? `${dto.customer.notes}\n\n${paymentNote}`
              : paymentNote;
          })(),
          shippingData: dto.customer?.address
            ? {
                address: dto.customer.address,
                city: dto.customer.city || '',
                lat: dto.customer.lat,
                lng: dto.customer.lng,
              }
            : undefined,
          items: {
            create: orderItemsData, // Relación pre-construida
          },
        },
      });
      orderIdToUse = newOrder.id;
    }

    // ================= ESTRATEGIA SEGUN PROVEEDOR ================= //

    if (activeProvider === 'MERCADO_PAGO') {
      const accessToken = storeSettings?.mpAccessToken;
      if (!accessToken)
        throw new BadRequestException('MercadoPago no está configurado');

      const client = new MercadoPagoConfig({ accessToken });
      const preference = new Preference(client);

      const metadata = {
        tenant_id: tenantId,
        type: 'order',
        items_json: JSON.stringify(dto.items),
        customer_name: dto.customer?.name || '',
        customer_email: dto.customer?.email || '',
        customer_phone: dto.customer?.phone || '',
        user_id: dto.customer?.userId || '',
        address: dto.customer?.address || '',
        city: dto.customer?.city || '',
        lng: dto.customer?.lng?.toString() || '',
        existing_order_id: orderIdToUse || '',
        identification: dto.customer?.identification || '',
      };

      const fullName = (dto.customer?.name || 'Cliente').trim();
      const nameParts = fullName.split(/\s+/);
      const firstName = nameParts[0];
      const lastName =
        nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Cliente';

      const preferenceData = {
        items: preferenceItems,
        payer: {
          name: firstName,
          surname: lastName,
          email: dto.customer?.email || `invitado@${tenantId}.com`,
          phone: dto.customer?.phone
            ? { area_code: '57', number: dto.customer.phone.replace(/\D/g, '') }
            : undefined,
          identification: dto.customer?.identification
            ? {
                type: 'CC',
                number: dto.customer.identification.replace(/\D/g, ''),
              }
            : undefined,
          address: dto.customer?.address
            ? {
                street_name: dto.customer.address,
                zip_code: dto.customer.city || '',
              }
            : undefined,
        },
        back_urls: {
          success: `${frontendUrl}/checkout/success`,
          failure: `${frontendUrl}/checkout/failure`,
          pending: `${frontendUrl}/checkout/pending`,
        },
        auto_return: 'approved' as const,
        notification_url: `${apiUrl}/api/payments/webhook?tenantId=${tenantId}`,
        metadata,
      };

      try {
        const response = await preference.create({ body: preferenceData });

        // Si creamoos u orden previa, actualizamos el provider a MP.
        // Pero dado nuestro flujo if (!orderIdToUse) arriba no entramos ahí.
        // Si quisiéramos crear la orden anticipada también para MP, deberíamos hacerlo arriba para todos, pero MP tiene el fallback metadata.

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
        throw new BadRequestException(
          'Error al iniciar el pago con MercadoPago',
        );
      }
    } else if (activeProvider === 'BOLD') {
      const boldApiKey = storeSettings?.boldApiKey;
      if (!boldApiKey)
        throw new BadRequestException(
          'La integración con Bold no tiene API Key configurada',
        );

      const redirectUrl = `${frontendUrl}/checkout/success?orderId=${orderIdToUse}`;
      const notificationUrl = `${apiUrl}/api/payments/webhook/bold?tenantId=${tenantId}`;
      const description = `Pago de Orden en ${storeSettings.storeName || 'Tienda'}`;

      let paymentMethodType: string | undefined = undefined;
      const checkoutMethod = dto.paymentMethod || '';
      if (checkoutMethod.startsWith('BOLD_')) {
        paymentMethodType = checkoutMethod.replace('BOLD_', '');
      }

      const boldResponse = await this.boldService.createPaymentLink(
        {
          orderId: orderIdToUse as string,
          totalAmount,
          currency,
          description,
          customerName: dto.customer?.name,
          customerEmail: dto.customer?.email,
          customerPhone: dto.customer?.phone,
          customerIdentification: dto.customer?.identification,
        },
        boldApiKey,
        redirectUrl,
        notificationUrl,
        paymentMethodType,
      );

      return {
        init_point: boldResponse.payment_link,
        sandbox_init_point: boldResponse.payment_link, // Bold no diferencia link sandbox/prod aquí a nivel respuesta si le pasas la llave test
        preferenceId: orderIdToUse,
        totalAmount,
      };
    } else if (activeProvider === 'CASH') {
      return {
        init_point: `${frontendUrl}/checkout/success?orderId=${orderIdToUse}&type=cash`,
        sandbox_init_point: `${frontendUrl}/checkout/success?orderId=${orderIdToUse}&type=cash`,
        preferenceId: orderIdToUse,
        totalAmount,
      };
    }

    throw new BadRequestException('Método de pago no soportado o inválido');
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

    if (tenantId === 'default') {
      this.logger.error(
        `Webhook rejected: Unable to determine tenant for data.id=${dataId}`,
      );
      return { status: 'error', reason: 'tenant not identified in webhook' };
    }

    const resolvedTenantId = tenantId;

    try {
      // 1. Recuperar Credenciales desde StoreSettings (SSOT)
      const storeSettings = await (
        this.prisma.secure as any
      ).storeSettings.findFirst({
        where: { tenantId: resolvedTenantId },
      });

      const accessToken = storeSettings?.mpAccessToken;

      if (!accessToken) {
        this.logger.error(
          `[PAYMENTS_WEBHOOK] Tenant ${resolvedTenantId} no tiene mpAccessToken en StoreSettings`,
        );
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
          const existingOrderId = metadata.existing_order_id;
          const identification = metadata.identification;

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
          await this.prisma.secure.$transaction(async (tx) => {
            let totalAmount = 0;
            const orderItemsData: any[] = [];
            const digitalItemsDispatch: any[] = [];

            // Batch fetch all modifiers involved
            const allModifierIds = items.flatMap(
              (i: any) => i.modifiers?.map((m: any) => m.modifierId) || [],
            );
            const allModifiers =
              allModifierIds.length > 0
                ? await tx.modifier.findMany({
                    where: { id: { in: allModifierIds } },
                  })
                : [];
            const modifierMap = new Map(allModifiers.map((m) => [m.id, m]));

            for (const item of items) {
              const variant = await tx.productVariant.findUnique({
                where: { id: item.variantId },
                include: { product: true },
              });

              if (!variant) continue;

              let itemPrice = Number(variant.price);
              const itemModifiersData: any[] = [];

              if (item.modifiers && item.modifiers.length > 0) {
                for (const modItem of item.modifiers) {
                  const mod = modifierMap.get(modItem.modifierId);
                  if (mod) {
                    itemPrice += Number(mod.priceAdjustment) * modItem.quantity;
                    itemModifiersData.push({
                      modifierId: mod.id,
                      modifierName: mod.name,
                      priceAdjustment: mod.priceAdjustment,
                      quantity: modItem.quantity,
                    });
                  }
                }
              }

              totalAmount += itemPrice * item.quantity;

              orderItemsData.push({
                variantId: variant.id,
                quantity: item.quantity,
                price: itemPrice,
                productName: variant.product.name,
                variantName: variant.name !== 'Standard' ? variant.name : null,
                isPaid: true,
                modifiers: {
                  create: itemModifiersData,
                },
              });

              if (variant.product.productType === 'DIGITAL') {
                digitalItemsDispatch.push(variant.product);
              }
            }

            if (orderItemsData.length === 0) {
              throw new Error('No valid items found for order');
            }

            let newOrder;

            if (existingOrderId) {
              const preExisting = await tx.order.findUnique({
                where: { id: existingOrderId },
              });

              if (!preExisting) {
                this.logger.error(
                  `Order ${existingOrderId} not found for payment ${dataId}`,
                );
                throw new Error(`Order ${existingOrderId} not found`);
              }

              newOrder = await tx.order.update({
                where: { id: existingOrderId },
                data: {
                  status: 'APPROVED',
                  mpPaymentId: dataId,
                  // Actualizar envío en caso de haberlo incluido
                  shippingData: address
                    ? {
                        address,
                        city,
                        lat,
                        lng,
                      }
                    : (preExisting.shippingData ?? undefined),
                  customerEmail: customerEmail || preExisting.customerEmail,
                  identification: identification || preExisting.identification,
                },
              });

              await tx.orderItem.updateMany({
                where: { orderId: existingOrderId },
                data: { isPaid: true },
              });
            } else {
              // Generar numero de orden
              const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`;

              newOrder = await tx.order.create({
                data: {
                  tenantId: resolvedTenantId,
                  orderNumber,
                  totalAmount,
                  status: 'APPROVED',
                  orderType: 'DELIVERY', // o 'DINE_IN' según modelo, asumiendo e-commerce
                  mpPaymentId: dataId,
                  customerName,
                  customerPhone,
                  customerEmail,
                  identification,
                  notes: '',
                  shippingData: address
                    ? {
                        address,
                        city,
                        lat,
                        lng,
                      }
                    : undefined,
                  items: {
                    create: orderItemsData,
                  },
                },
              });
            }

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
    const [activeSubscriptions, pendingSubscriptions] = await Promise.all([
      this.prisma.secure.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.secure.subscription.count({ where: { status: 'PENDING' } }),
    ]);

    const recentSubscriptions = await this.prisma.secure.subscription.findMany({
      where: { status: 'ACTIVE' },
      take: 10,
      orderBy: { startDate: 'desc' },
      include: { user: { select: { email: true, name: true } } },
    });

    // En versiones anteriores había purchase count, lo dejamos como 0 para no romper reportes frontend
    const totalEbookPurchases = 0;

    return {
      activeSubscriptions,
      totalEbookPurchases,
      pendingSubscriptions,
      recentSubscriptions,
    };
  }

  // ==================== BOLD WEBHOOK ====================

  async processBoldWebhook(
    body: any,
    tenantId: string,
    signature: string,
    rawBody?: Buffer,
  ) {
    this.logger.log(`Received Bold Webhook for tenant ${tenantId}`, {
      event: body.event,
      status: body.payment?.status || body.status,
    });

    // 1. Obtener el secreto del tenant para validar la firma
    // Usamos findFirst en StoreSettings para este tenant
    const storeSettings = await this.prisma.secure.storeSettings.findFirst({
      where: { tenantId },
    });

    const secret = storeSettings?.boldSecretKey;

    // 2. Validar firma HMAC (Seguridad)
    if (rawBody && signature && secret) {
      const isValid = this.boldService.verifyWebhookSignature(
        rawBody,
        signature,
        secret,
      );
      if (!isValid) {
        this.logger.error(
          `Invalid Bold Webhook Signature for tenant ${tenantId}`,
        );
        return { status: 'error', reason: 'invalid signature' };
      }
    } else {
      this.logger.warn(
        `Bold Webhook received without signature validation (missing signature or secret for tenant ${tenantId})`,
      );
    }

    const payment = body?.payment || body;
    if (!payment || !payment.reference) {
      return {
        status: 'ignored',
        reason: 'Invalid bold webhook payload (missing payment reference)',
      };
    }

    // La referencia es el orderId que enviamos al crear el link
    // Nota: Bold suele enviar algo como "ORD-123-timestamp", pero nosotros enviamos "ID_ORDEN"
    // o "ID_ORDEN-timestamp" según BoldService.
    const referenceParts = payment.reference.split('-');
    const orderId = referenceParts[0];
    const paymentStatus = payment.status; // APPROVED, REJECTED, FAILED
    const paymentId = payment.id || payment.transaction_id;

    const order = await this.prisma.secure.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: { select: { email: true, name: true } } },
    });

    if (!order) {
      this.logger.error(`Order ${orderId} not found for Bold webhook`);
      return { status: 'error', reason: 'Order not found' };
    }

    // Anti-IDOR: Verificar que la orden pertenezca al tenant que envió el webhook
    if (order.tenantId !== tenantId) {
      this.logger.error(
        `Security Breach: Webhook tenant ${tenantId} tried updating order ${orderId} belonging to ${order.tenantId}`,
      );
      return { status: 'error', reason: 'Order tenant mismatch' };
    }

    // 3. Manejo de Estados
    if (paymentStatus === 'APPROVED') {
      if (order.status === 'APPROVED' || order.status === 'DELIVERED') {
        return { status: 'processed', reason: 'Already approved' };
      }

      await this.prisma.secure.$transaction([
        this.prisma.secure.order.update({
          where: { id: orderId },
          data: {
            status: 'APPROVED',
            paymentExternalId: paymentId?.toString(),
            paymentProvider: 'BOLD',
          },
        }),
        this.prisma.secure.orderItem.updateMany({
          where: { orderId: orderId },
          data: { isPaid: true },
        }),
      ]);

      this.logger.log(`Order ${orderId} APPROVED via Bold Webhook`);

      // 4. Fulfillment (Productos Digitales / Emails)
      // Reutilizamos approveOrder si queremos email genérico, o llamamos la lógica directamente
      await this.approveOrder(orderId, paymentId?.toString() || 'BOLD_PAYMENT');
    } else if (
      paymentStatus === 'REJECTED' ||
      paymentStatus === 'FAILED' ||
      paymentStatus === 'DECLINED'
    ) {
      this.logger.warn(
        `Order ${orderId} REJECTED/FAILED via Bold Webhook: ${paymentStatus}`,
      );

      if (order.status === 'PENDING') {
        await this.prisma.secure.order.update({
          where: { id: orderId },
          data: {
            status: 'CANCELLED',
            notes:
              (order.notes || '') +
              `\nPago rechazado por Bold (${paymentStatus})`,
          },
        });
      }
    }

    return { status: 'processed' };
  }
}
