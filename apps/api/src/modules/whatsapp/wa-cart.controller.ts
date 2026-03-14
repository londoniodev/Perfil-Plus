import { Controller, Get, Param, NotFoundException, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Public } from '../../common/decorators/public.decorator';
import { ClsService } from 'nestjs-cls';

@Public()
@Controller('wa-cart')
export class WaCartController {
  private readonly logger = new Logger(WaCartController.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly cls: ClsService
  ) {}

  /**
   * GET /api/wa-cart/:id
   * Endpoint público que retorna los datos del carrito temporal de WhatsApp desde Redis.
   */
  @Get(':id')
  async getCart(@Param('id') id: string) {
    const tenantId = this.cls.get('tenantId');
    
    if (!tenantId) {
      this.logger.error('No tenantId found in CLS for /wa-cart request');
      throw new NotFoundException('Falta identificación de tienda (Tenant ID).');
    }

    const redisKey = `wa_cart:${tenantId}:${id}`;
    const cachedData = await this.cacheManager.get<string>(redisKey);

    if (!cachedData) {
      this.logger.warn(`Carrito no encontrado o expirado en Redis: ${id}`);
      throw new NotFoundException('El enlace de pago es inválido o ya expiró.');
    }

    try {
      const cart = JSON.parse(cachedData);
      return {
        items: cart.items,
        customerData: cart.customerData,
        source: 'redis'
      };
    } catch (error) {
      this.logger.error(`Error parseando carrito de Redis (${id}): ${error.message}`);
      throw new NotFoundException('Error al recuperar los datos del carrito.');
    }
  }
}
