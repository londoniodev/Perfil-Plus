import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CorsCacheService implements OnModuleInit {
  private readonly logger = new Logger(CorsCacheService.name);
  private readonly baseDomain: string;
  private readonly REDIS_KEY = 'cors_allowed_origins';

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.baseDomain =
      this.configService.get<string>('BASE_DOMAIN') ||
      this.configService.get<string>('MAIN_DOMAIN') ||
      this.configService.get<string>('NEXT_PUBLIC_BASE_DOMAIN') ||
      'perfil.plus';
  }

  async onModuleInit() {
    await this.loadOriginsToRedis();
  }

  private getRedisClient() {
    const manager = this.cacheManager as any;
    let client: any = null;

    // Con cache-manager v6+, el store principal suele estar en el array "stores"
    const firstStore = manager?.stores ? manager.stores[0] : null;

    // Dependiendo de la versión de cache-manager y nestjs/cache-manager, el store se anida diferente
    const possibleStores = [
      firstStore, // Nuevo wrapper de Multi-store (Keyv instance)
      firstStore?.store,
      firstStore?._store, // Keyv internal adapter (Aquí debería estar RedisStore)
      firstStore?.opts?.store, // Keyv options store
      manager?.store,
      manager?.store?.store,
      manager?._store,
      manager?.md?.store
    ];

    for (const s of possibleStores) {
      if (!s) continue;
      
      // Buscar cliente de Redis (Node-redis o Ioredis)
      client =
        s.client ||
        s.redisCache || // cache-manager-redis-yet a veces expone redisCache
        s._client ||
        s.redis ||
        s.redisClient;

      if (client && typeof client.sAdd === 'function') {
        break; // Cliente válido para Set operations (Redis) encontrado
      }
    }

    if (!client || typeof client.sAdd !== 'function') {
      this.logger.warn(`[DEBUG CORS] No se pudo extraer el cliente Redis de CacheManager. Volcando estructura...`);
      this.logger.warn(`[DEBUG CORS] CacheManager keys: ${Object.keys(manager || {}).join(', ')}`);
      
      if (manager?.stores && manager.stores.length > 0) {
        const s = manager.stores[0];
        this.logger.warn(`[DEBUG CORS] stores[0] keys: ${Object.keys(s || {}).join(', ')}`);
        if (s?._store) {
           this.logger.warn(`[DEBUG CORS] stores[0]._store keys: ${Object.keys(s._store || {}).join(', ')}`);
           this.logger.warn(`[DEBUG CORS] type of _store: ${typeof s._store}`);
        }
        if (s?.opts?.store) {
           this.logger.warn(`[DEBUG CORS] stores[0].opts.store keys: ${Object.keys(s.opts.store || {}).join(', ')}`);
        }
      } else if (manager?.store) {
        this.logger.warn(`[DEBUG CORS] Store keys: ${Object.keys(manager.store || {}).join(', ')}`);
        this.logger.warn(`[DEBUG CORS] Store name: ${manager.store.name || 'unknown'}`);
        if ((manager.store as any).store) {
          this.logger.warn(`[DEBUG CORS] Store.Store keys: ${Object.keys((manager.store as any).store).join(', ')}`);
        }
      }
      
      return null;
    }

    return client;
  }

  /**
   * Carga todos los dominios existentes de tenants en Redis.
   * Se ejecuta una sola vez al iniciar el módulo.
   */
  private async loadOriginsToRedis(): Promise<void> {
    const redisClient = this.getRedisClient();
    if (!redisClient) {
      this.logger.warn(
        `Redis client NOT found in CacheManager. CORS will fallback to Database queries!`,
      );
      return;
    }

    try {
      // Borrar el SET existente
      await redisClient.del(this.REDIS_KEY);

      // SECURITY EXCEPTION: Global infrastructure query for CORS. Does not leak tenant data.
      /* eslint-disable no-restricted-syntax */
      const tenants = await this.prisma.tenant.findMany({
        select: { slug: true, domain: true },
      });
      /* eslint-enable no-restricted-syntax */

      const originsToAdd: string[] = [];

      for (const tenant of tenants) {
        // Subdomain origin: https://{slug}.{baseDomain}
        if (tenant.slug && this.baseDomain) {
          const origin = this.normalizeDomain(
            `${tenant.slug}.${this.baseDomain}`,
          );
          if (origin) originsToAdd.push(`https://${origin}`);
        }

        // Custom domain origin: https://{domain}
        if (tenant.domain) {
          const origin = this.normalizeDomain(tenant.domain);
          if (origin) originsToAdd.push(`https://${origin}`);
        }
      }

      if (originsToAdd.length > 0) {
        await redisClient.sAdd(this.REDIS_KEY, originsToAdd);
      }

      this.logger.log(
        `CORS Cache inicializado en Redis con ${originsToAdd.length} orígenes correspondientes a ${tenants.length} tenants`,
      );
    } catch (error: any) {
      this.logger.error(
        `Error cargando orígenes CORS hacia Redis: ${error.message}`,
      );
    }
  }

  /**
   * Agrega un nuevo origen a Redis (sin reiniciar el servidor).
   * Se llama después de crear un nuevo Tenant.
   */
  async addOrigin(origin: string): Promise<void> {
    const redisClient = this.getRedisClient();
    if (redisClient) {
      try {
        await redisClient.sAdd(this.REDIS_KEY, origin);
        this.logger.log(`Nuevo origen CORS agregado a Redis: ${origin}`);
      } catch (error: any) {
        this.logger.error(`Error agregando origen a Redis: ${error.message}`);
      }
    }
  }

  /**
   * Elimina un origen de Redis.
   */
  async removeOrigin(origin: string): Promise<void> {
    const redisClient = this.getRedisClient();
    if (redisClient) {
      try {
        await redisClient.sRem(this.REDIS_KEY, origin);
        this.logger.log(`Origen CORS eliminado de Redis: ${origin}`);
      } catch (error: any) {
        this.logger.error(`Error eliminando origen de Redis: ${error.message}`);
      }
    }
  }

  /**
   * Verifica asíncronamente si un origen está permitido en Redis o mediante Fallback a DB
   */
  async checkOrigin(origin: string): Promise<boolean> {
    const redisClient = this.getRedisClient();

    // Normalizar el origen recibido (de Unicode a Punycode si es necesario)
    const normalizedOriginName = this.normalizeDomain(origin);
    const normalizedOrigin = `https://${normalizedOriginName}`;

    // Validar en Redis primero si está disponible
    if (redisClient) {
      try {
        const isAllowed = await redisClient.sIsMember(
          this.REDIS_KEY,
          normalizedOrigin,
        );
        if (isAllowed) return true;
      } catch (error: any) {
        this.logger.warn(
          `Redis falló al verificar CORS para ${origin}, haciendo fallback a BD: ${error.message}`,
        );
      }
    }

    // SILENT FALLBACK A BD
    try {
      const matchDomain = normalizedOriginName;

      const baseDomainCheck = this.normalizeDomain(this.baseDomain);
      let slugCheck = '';
      if (baseDomainCheck && matchDomain.endsWith(`.${baseDomainCheck}`)) {
        slugCheck = matchDomain.replace(`.${baseDomainCheck}`, '');
      }

      // IMPORTANTE: Buscamos todos los tenants y normalizamos en memoria o
      // confiamos en que al menos uno coincida.
      // Optimización: Buscamos por slug si coincide con el patrón del baseDomain.
      const tenants = await this.prisma.tenant.findMany({
        where: {
          OR: [
            { slug: slugCheck || undefined },
            // No buscamos directamente por domain porque puede estar en Unicode en la DB
            // mientras que matchDomain es Punycode.
          ],
        },
        select: { id: true, domain: true },
      });

      for (const t of tenants) {
        if (slugCheck && t.id) return true; // Match por slug
        if (t.domain && this.normalizeDomain(t.domain) === matchDomain)
          return true; // Match por dominio normalizado
      }

      // Si no hubo match por slug, buscamos por dominio (lento pero seguro si hay pocos tenants)
      if (tenants.length === 0) {
        const allCustomDomains = await this.prisma.tenant.findMany({
          where: { domain: { not: null } },
          select: { domain: true },
        });
        for (const t of allCustomDomains) {
          if (t.domain && this.normalizeDomain(t.domain) === matchDomain)
            return true;
        }
      }
    } catch (err: any) {
      // Ignore invalid URLs or DB query errors silently
    }

    return false;
  }

  /**
   * Normaliza un dominio a su versión Punycode (ASCII) segura para comparaciones CORS.
   */
  private normalizeDomain(domain: string): string {
    if (!domain) return '';
    try {
      // Si ya tiene protocolo, lo usamos. Si no, lo agregamos para que URL() funcione.
      const urlString = domain.startsWith('http')
        ? domain
        : `https://${domain}`;
      const url = new URL(urlString.toLowerCase());
      return url.hostname;
    } catch (e) {
      // Fallback básico si URL falla
      return domain
        .toLowerCase()
        .trim()
        .replace(/^https?:\/\//, '')
        .split('/')[0];
    }
  }

  /**
   * Devuelve el dominio base configurado.
   */
  getBaseDomain(): string {
    return this.baseDomain;
  }
}
