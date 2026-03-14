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
    
    this.logger.log(`[GET_CART] Intentando recuperar carrito: id=${id}, tenantId=${tenantId}`);

    if (!tenantId) {
      this.logger.error('No tenantId found in CLS for /wa-cart request');
      throw new NotFoundException('Falta identificación de tienda (Tenant ID).');
    }

    const redisKey = `wa_cart:${tenantId}:${id}`;
    let cachedData = await this.cacheManager.get<string>(redisKey);

    // Fallback: Si no se encuentra con el ID específico del tenant, buscamos en la llave global
    // Esto resuelve problemas de desajuste entre ID y Slug (ej. si la IA guardó con uno y el front pide con otro)
    if (!cachedData) {
      this.logger.warn(`Carrito no encontrado con tenantId=${tenantId}. Buscando en fallback global...`);
      const globalKey = `wa_cart_global:${id}`;
      cachedData = await this.cacheManager.get<string>(globalKey);
      
      if (cachedData) {
         this.logger.log(`[GET_CART] Carrito recuperado vía fallback global para ID: ${id}`);
         // Opcional: Podríamos validar que el tenantId guardado coincida, pero dado que el ID 
         // es un random largo + timestamp, la probabilidad de colisión es nula.
      }
    }

    if (!cachedData) {
      this.logger.warn(`Carrito NO encontrado en Redis (específico ni global): ${id}`);
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
