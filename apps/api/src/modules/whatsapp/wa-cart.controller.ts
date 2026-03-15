import { Controller, Get, Param, NotFoundException, Logger, Headers } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Public()
@Controller('wa-cart')
export class WaCartController {
  private readonly logger = new Logger(WaCartController.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * GET /api/wa-cart/:id
   * Endpoint público que retorna los datos del carrito temporal de WhatsApp desde Postgres.
   */
  @Get(':id')
  async getCart(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    this.logger.log(`[GET_CART] Consultando Postgres id=${id}, tenantId=${tenantId || 'NO_HEADER'}`);

    let cart;

    if (tenantId) {
      // Prioritario: Buscar de forma segura con el tenantId provisto
      cart = await (this.prisma.secure as any).waCart.findUnique({
        where: { id: id, tenantId: tenantId },
      });
      if (cart) {
        this.logger.log(`[GET_CART] ✅ Carrito encontrado con tenantId: ${tenantId}`);
      }
    }

    // Fallback: Si no hay tenantId en los headers o no lo encontró, buscar solo por ID
    // Esto previene que una desincronización de headers rompa el carrito
    if (!cart) {
      cart = await (this.prisma.secure as any).waCart.findFirst({
        where: { id: id },
      });
      if (cart) {
        this.logger.log(`[GET_CART] ✅ Carrito encontrado vía fallback de ID. Tenant asociado: ${cart.tenantId}`);
      }
    }

    if (!cart) {
      this.logger.warn(`[GET_CART] ❌ Carrito NO encontrado en DB. ID=${id}, TenantID=${tenantId || 'N/A'}`);
      throw new NotFoundException('El enlace de pago es inválido o ya expiró.');
    }

    // Comprobar expiración manualmente por seguridad
    if (new Date() > cart.expiresAt) {
      this.logger.warn(`[GET_CART] 🚨 Carrito expirado en DB. ID=${id}`);
      throw new NotFoundException('El enlace de pago ya expiró (duración 24 horas).');
    }

    try {
      const cartData = typeof cart.cartData === 'string' ? JSON.parse(cart.cartData) : cart.cartData;
      this.logger.log(`[GET_CART] Carrito servido exitosamente (items=${cartData.items?.length || 0})`);
      return {
        items: cartData.items,
        customerData: cartData.customerData,
        source: 'database',
      };
    } catch (error) {
      this.logger.error(`[GET_CART] Error parseando datos del carrito (${id}): ${error.message}`);
      throw new NotFoundException('Error recuperando los datos de este pedido.');
    }
  }
}
