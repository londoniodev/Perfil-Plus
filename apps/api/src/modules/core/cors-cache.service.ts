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
      this.configService.get<string>('MAIN_DOMAIN') ||
      this.configService.get<string>('NEXT_PUBLIC_BASE_DOMAIN') ||
      '';
  }

  async onModuleInit() {
    await this.loadOriginsToRedis();
  }

  private getRedisClient() {
    return (this.cacheManager as any).store?.client || null;
  }

  /**
   * Carga todos los dominios existentes de tenants en Redis.
   * Se ejecuta una sola vez al iniciar el módulo.
   */
  private async loadOriginsToRedis(): Promise<void> {
    const redisClient = this.getRedisClient();
    if (!redisClient) {
      this.logger.warn(`Redis client NOT found in CacheManager. CORS will fallback to Database queries!`);
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
          originsToAdd.push(`https://${tenant.slug}.${this.baseDomain}`);
        }

        // Custom domain origin: https://{domain}
        if (tenant.domain) {
          originsToAdd.push(`https://${tenant.domain}`);
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

    // Validar en Redis primero si está disponible
    if (redisClient) {
      try {
        const isAllowed = await redisClient.sIsMember(this.REDIS_KEY, origin);
        if (isAllowed) return true;
      } catch (error: any) {
        this.logger.warn(`Redis falló al verificar CORS para ${origin}, haciendo fallback a BD: ${error.message}`);
      }
    }

    // SILENT FALLBACK A BD
    try {
      const url = new URL(origin);
      const matchDomain = url.hostname;
      
      let baseDomainCheck = this.baseDomain;
      let slugCheck = '';
      if (baseDomainCheck && matchDomain.endsWith(`.${baseDomainCheck}`)) {
          slugCheck = matchDomain.replace(`.${baseDomainCheck}`, '');
      }

      /* eslint-disable no-restricted-syntax */
      const tenant = await this.prisma.tenant.findFirst({
        where: {
          OR: [
             { domain: matchDomain },
             ...(slugCheck ? [{ slug: slugCheck }] : [])
          ]
        },
        select: { id: true }
      });
      /* eslint-enable no-restricted-syntax */
      
      if (tenant) {
        return true;
      }
    } catch (err: any) {
       // Ignore invalid URLs or DB query errors silently
    }

    return false;
  }

  /**
   * Devuelve el dominio base configurado.
   */
  getBaseDomain(): string {
    return this.baseDomain;
  }
}
