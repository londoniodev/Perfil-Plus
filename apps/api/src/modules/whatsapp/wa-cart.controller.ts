import { Controller, Get, Param, NotFoundException, Logger, Inject, Headers } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Public } from '../../common/decorators/public.decorator';

@Public()
@Controller('wa-cart')
export class WaCartController {
  private readonly logger = new Logger(WaCartController.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * GET /api/wa-cart/debug/redis-health
   * Endpoint de diagnóstico para verificar si Redis está conectado y persistiendo.
   */
  @Get('debug/redis-health')
  async redisHealth() {
    const cacheBackend = (global as any).__CACHE_BACKEND__ || 'UNKNOWN';
    const testKey = `wa_cart_debug:${Date.now()}`;
    const testValue = JSON.stringify({ test: true, timestamp: new Date().toISOString() });

    try {
      // Escribir
      await this.cacheManager.set(testKey, testValue, 60000); // TTL 60s
      this.logger.log(`[DEBUG] Key escrita: ${testKey}`);

      // Leer inmediatamente
      const readBack = await this.cacheManager.get<string>(testKey);
      
      // Limpiar
      await this.cacheManager.del(testKey);

      if (readBack === testValue) {
        return {
          status: 'OK',
          cacheBackend,
          message: 'Redis está conectado y persistiendo datos correctamente.',
          readBack: JSON.parse(readBack),
        };
      } else {
        return {
          status: 'WARN',
          cacheBackend,
          message: 'La escritura fue exitosa pero la lectura devolvió un valor diferente.',
          expected: testValue,
          actual: readBack,
        };
      }
    } catch (error) {
      this.logger.error(`[DEBUG] Error en health check: ${error.message}`);
      return {
        status: 'ERROR',
        cacheBackend,
        message: `Redis no está funcionando: ${error.message}`,
      };
    }
  }

  /**
   * GET /api/wa-cart/:id
   * Endpoint público que retorna los datos del carrito temporal de WhatsApp desde Redis.
   * 
   * Estrategia de búsqueda (en orden):
   * 1. Key global `wa_cart_global:{id}` — siempre se guarda sin depender de tenantId
   * 2. Key específica `wa_cart:{tenantId}:{id}` — fallback si la global no existe
   */
  @Get(':id')
  async getCart(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    this.logger.log(`[GET_CART] id=${id}, tenantId=${tenantId || 'NO_HEADER'}`);

    // ━━━ ESTRATEGIA: Priorizar key GLOBAL (más confiable) ━━━
    // La key global siempre se guarda sin depender de que el tenantId coincida
    // entre el backend (que lo saca de la DB) y el frontend (que lo envía por header).
    const globalKey = `wa_cart_global:${id}`;
    let cachedData = await this.cacheManager.get<string>(globalKey);
    let source = 'global';

    if (cachedData) {
      this.logger.log(`[GET_CART] ✅ Carrito encontrado en key global: ${globalKey}`);
    }

    // Fallback: intentar con la key específica del tenant
    if (!cachedData && tenantId) {
      const tenantKey = `wa_cart:${tenantId}:${id}`;
      cachedData = await this.cacheManager.get<string>(tenantKey);
      source = 'tenant';
      if (cachedData) {
        this.logger.log(`[GET_CART] ✅ Carrito encontrado en key tenant: ${tenantKey}`);
      }
    }

    // Diagnóstico: si no se encontró en ninguna key
    if (!cachedData) {
      this.logger.warn(
        `[GET_CART] ❌ Carrito NO encontrado. ID=${id}, TenantID=${tenantId || 'N/A'}. ` +
        `Keys consultadas: [${globalKey}]${tenantId ? `, [wa_cart:${tenantId}:${id}]` : ''}`
      );
      throw new NotFoundException('El enlace de pago es inválido o ya expiró.');
    }

    try {
      const cart = JSON.parse(cachedData);
      this.logger.log(`[GET_CART] Carrito servido (source=${source}, items=${cart.items?.length || 0})`);
      return {
        items: cart.items,
        customerData: cart.customerData,
        source,
      };
    } catch (error) {
      this.logger.error(`[GET_CART] Error parseando carrito (${id}): ${error.message}`);
      throw new NotFoundException('Error al recuperar los datos del carrito.');
    }
  }
}
