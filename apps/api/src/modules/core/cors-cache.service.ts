/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║                     CORS CACHE SERVICE                               ║
 * ║  Servicio de caché de orígenes CORS para arquitectura Multi-Tenant.  ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 *
 * ## ¿POR QUÉ EXISTE ESTE SERVICIO?
 *
 * En una arquitectura multi-tenant con dominios dinámicos (subdominios y
 * dominios custom), la lista de orígenes CORS permitidos cambia cada vez
 * que se crea, edita o elimina un tenant. Consultar la base de datos en
 * cada preflight request (OPTIONS) y cada petición real sería ineficiente
 * y saturaría PostgreSQL con queries repetitivas.
 *
 * Este servicio mantiene un Redis SET (`cors_allowed_origins`) con todos
 * los orígenes válidos. La verificación CORS se hace en O(1) contra Redis.
 *
 * ## ARQUITECTURA DE CACHÉ
 *
 * ```
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  Petición HTTP con Origin header                                │
 * │      ↓                                                          │
 * │  main.ts → enableCors({ origin: callback })                     │
 * │      ↓                                                          │
 * │  CorsCacheService.checkOrigin(origin)                           │
 * │      ↓                                                          │
 * │  1. Redis SISMEMBER "cors_allowed_origins" origin   [O(1)]      │
 * │      ↓ (si Redis no disponible o no encontrado)                 │
 * │  2. Fallback a PostgreSQL query por slug/domain     [O(n)]      │
 * │      ↓                                                          │
 * │  Resultado: true/false                                          │
 * └─────────────────────────────────────────────────────────────────┘
 * ```
 *
 * ## ¿POR QUÉ CONEXIÓN REDIS PROPIA?
 *
 * NestJS CacheModule (v3) + cache-manager (v7) usan Keyv como wrapper
 * interno. Keyv encapsula el store de Redis en un KeyvStoreAdapter
 * completamente cerrado, haciendo IMPOSIBLE acceder al cliente nativo
 * de Redis para operaciones avanzadas (SADD, SISMEMBER, SREM).
 *
 * Por eso, este servicio crea su PROPIA conexión Redis dedicada,
 * usando la misma configuración (REDIS_HOST, REDIS_PORT, REDIS_PASSWORD)
 * del entorno. Esto es:
 *   - Más limpio: sin depender de internals de cache-manager/Keyv
 *   - Más robusto: inmune a cambios de versión de cache-manager
 *   - Eficiente: una sola conexión persistente para operaciones CORS
 *
 * ## FLUJO DE VIDA
 *
 * 1. onModuleInit() → Conecta a Redis y carga todos los orígenes
 * 2. checkOrigin()  → Verifica en Redis (O(1)), fallback a DB
 * 3. addOrigin()    → Llamado al crear un Tenant (hot-add sin restart)
 * 4. removeOrigin() → Llamado al eliminar un Tenant
 * 5. onModuleDestroy() → Cierra la conexión Redis limpiamente
 */

import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CorsCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CorsCacheService.name);
  private readonly baseDomain: string;
  private readonly REDIS_KEY = 'cors_allowed_origins';

  /**
   * Cliente Redis dedicado para operaciones CORS (Sets).
   * Separado del CacheModule de NestJS intencionalmente.
   * Ver documentación del módulo para entender por qué.
   */
  private redisClient: RedisClientType | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.baseDomain =
      this.configService.get<string>('BASE_DOMAIN') ||
      this.configService.get<string>('MAIN_DOMAIN') ||
      this.configService.get<string>('NEXT_PUBLIC_BASE_DOMAIN') ||
      'perfil.plus';
  }

  // ─────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────────────────────────

  async onModuleInit() {
    await this.connectRedis();
    await this.loadOriginsToRedis();
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit().catch(() => {});
      this.logger.log('Conexión Redis CORS cerrada correctamente');
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // CONEXIÓN REDIS DEDICADA
  // ─────────────────────────────────────────────────────────────────

  /**
   * Crea una conexión Redis dedicada para operaciones CORS.
   * Usa las mismas variables de entorno que el CacheModule global:
   *   - REDIS_HOST (default: 'redis')
   *   - REDIS_PORT (default: 6379)
   *   - REDIS_PASSWORD (opcional)
   */
  private async connectRedis(): Promise<void> {
    const host = this.configService.get('REDIS_HOST') || 'localhost';
    const port =
      parseInt(this.configService.get('REDIS_PORT') || '6379') || 6379;
    const password = this.configService.get('REDIS_PASSWORD') || undefined;

    try {
      this.redisClient = createClient({
        socket: {
          host,
          port,
          connectTimeout: 5000,
          reconnectStrategy: (retries) => {
            if (retries > 3) {
              this.logger.warn(
                'Redis CORS: Máximo de reintentos alcanzado. Operando sin caché.',
              );
              return false; // Dejar de reintentar
            }
            return Math.min(retries * 500, 3000);
          },
        },
        password,
      }) as RedisClientType;

      // Listener de errores para evitar crash del proceso
      this.redisClient.on('error', (err) => {
        this.logger.error(`Redis CORS error: ${err.message}`);
      });

      await this.redisClient.connect();
      this.logger.log(
        `✅ Redis CORS conectado (${host}:${port}) — Conexión dedicada para validación de orígenes`,
      );
    } catch (error: any) {
      this.logger.warn(
        `⚠️ Redis CORS no disponible (${host}:${port}): ${error.message}. ` +
          `CORS hará fallback a consultas PostgreSQL.`,
      );
      this.redisClient = null;
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // CARGA INICIAL DE ORÍGENES
  // ─────────────────────────────────────────────────────────────────

  /**
   * Carga todos los dominios de tenants en un Redis SET.
   * Se ejecuta UNA sola vez al arrancar el módulo.
   *
   * Genera orígenes en formato: https://{slug}.{baseDomain}
   * y https://{customDomain} para tenants con dominio propio.
   */
  private async loadOriginsToRedis(): Promise<void> {
    if (!this.redisClient) return;

    try {
      // Limpiar SET existente para reconstruirlo desde cero
      await this.redisClient.del(this.REDIS_KEY);

      // SECURITY EXCEPTION: Query global de infraestructura.
      // No filtra por tenant porque necesita TODOS los orígenes del sistema.
      const tenants = await this.prisma.tenant.findMany({
        select: { slug: true, domain: true },
      });

      const originsToAdd: string[] = [];

      for (const tenant of tenants) {
        // Subdominio: https://{slug}.perfil.plus
        if (tenant.slug && this.baseDomain) {
          const origin = this.normalizeDomain(
            `${tenant.slug}.${this.baseDomain}`,
          );
          if (origin) originsToAdd.push(`https://${origin}`);
        }

        // Dominio custom: https://{domain}
        if (tenant.domain) {
          const origin = this.normalizeDomain(tenant.domain);
          if (origin) originsToAdd.push(`https://${origin}`);
        }
      }

      if (originsToAdd.length > 0) {
        await this.redisClient.sAdd(this.REDIS_KEY, originsToAdd);
      }

      this.logger.log(
        `CORS Cache inicializado con ${originsToAdd.length} orígenes ` +
          `de ${tenants.length} tenants`,
      );
    } catch (error: any) {
      this.logger.error(
        `Error cargando orígenes CORS hacia Redis: ${error.message}`,
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // OPERACIONES PÚBLICAS (CRUD de orígenes)
  // ─────────────────────────────────────────────────────────────────

  /**
   * Agrega un nuevo origen al SET de Redis.
   * Llamar después de crear un nuevo Tenant (hot-add sin restart).
   */
  async addOrigin(origin: string): Promise<void> {
    if (!this.redisClient) return;

    try {
      await this.redisClient.sAdd(this.REDIS_KEY, origin);
      this.logger.log(`Nuevo origen CORS agregado: ${origin}`);
    } catch (error: any) {
      this.logger.error(`Error agregando origen CORS: ${error.message}`);
    }
  }

  /**
   * Elimina un origen del SET de Redis.
   * Llamar después de eliminar un Tenant.
   */
  async removeOrigin(origin: string): Promise<void> {
    if (!this.redisClient) return;

    try {
      await this.redisClient.sRem(this.REDIS_KEY, origin);
      this.logger.log(`Origen CORS eliminado: ${origin}`);
    } catch (error: any) {
      this.logger.error(`Error eliminando origen CORS: ${error.message}`);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // VERIFICACIÓN DE ORIGEN (HOT PATH)
  // ─────────────────────────────────────────────────────────────────

  /**
   * Verifica si un origen está permitido.
   *
   * Estrategia de 2 capas:
   *   1. Redis SISMEMBER — O(1), ultra rápido
   *   2. PostgreSQL query — Fallback si Redis no disponible
   *
   * @param origin - El header Origin de la petición HTTP (ej: "https://bocata.perfil.plus")
   * @returns true si el origen está permitido
   */
  async checkOrigin(origin: string): Promise<boolean> {
    // Normalizar el origen (Unicode → Punycode)
    const normalizedHostname = this.normalizeDomain(origin);
    const normalizedOrigin = `https://${normalizedHostname}`;

    // ── Capa 1: Redis (O(1)) ──
    if (this.redisClient) {
      try {
        const isAllowed = await this.redisClient.sIsMember(
          this.REDIS_KEY,
          normalizedOrigin,
        );
        if (isAllowed) return true;
      } catch (error: any) {
        this.logger.warn(
          `Redis CORS falló para ${origin}, fallback a BD: ${error.message}`,
        );
      }
    }

    // ── Capa 2: PostgreSQL (fallback) ──
    return this.checkOriginFromDatabase(normalizedHostname);
  }

  // ─────────────────────────────────────────────────────────────────
  // FALLBACK A BASE DE DATOS
  // ─────────────────────────────────────────────────────────────────

  /**
   * Busca el origen directamente en PostgreSQL.
   * Se usa cuando Redis no está disponible o el origen no fue
   * encontrado en el SET (puede ser un tenant recién creado
   * por otro pod/instancia que aún no sincronizó).
   */
  private async checkOriginFromDatabase(
    hostname: string,
  ): Promise<boolean> {
    try {
      const baseDomainNormalized = this.normalizeDomain(this.baseDomain);
      let slugCheck = '';

      // Extraer slug del subdominio: "bocata.perfil.plus" → "bocata"
      if (
        baseDomainNormalized &&
        hostname.endsWith(`.${baseDomainNormalized}`)
      ) {
        slugCheck = hostname.replace(`.${baseDomainNormalized}`, '');
      }

      // Búsqueda optimizada: primero por slug (indexed), luego por dominio custom
      const tenants = await this.prisma.tenant.findMany({
        where: {
          OR: [
            { slug: slugCheck || undefined },
            // No buscamos por domain directamente porque puede estar en
            // Unicode en la DB mientras que hostname ya es Punycode.
          ],
        },
        select: { id: true, domain: true },
      });

      for (const t of tenants) {
        if (slugCheck && t.id) return true; // Match por slug
        if (t.domain && this.normalizeDomain(t.domain) === hostname)
          return true;
      }

      // Búsqueda exhaustiva por dominio custom (lento, pero necesario)
      if (tenants.length === 0) {
        const allCustomDomains = await this.prisma.tenant.findMany({
          where: { domain: { not: null } },
          select: { domain: true },
        });
        for (const t of allCustomDomains) {
          if (t.domain && this.normalizeDomain(t.domain) === hostname)
            return true;
        }
      }
    } catch {
      // Ignorar errores de URL inválidas o queries fallidas silenciosamente
    }

    return false;
  }

  // ─────────────────────────────────────────────────────────────────
  // UTILIDADES
  // ─────────────────────────────────────────────────────────────────

  /**
   * Normaliza un dominio a Punycode (ASCII) para comparaciones seguras.
   *
   * Ejemplos:
   *   "https://álvaro.perfil.plus" → "xn--lvaro-gra.perfil.plus"
   *   "bocata.perfil.plus"         → "bocata.perfil.plus"
   *   "BOCATA.Perfil.PLUS"         → "bocata.perfil.plus"
   */
  private normalizeDomain(domain: string): string {
    if (!domain) return '';
    try {
      const urlString = domain.startsWith('http')
        ? domain
        : `https://${domain}`;
      const url = new URL(urlString.toLowerCase());
      return url.hostname;
    } catch {
      // Fallback básico si URL() no puede parsear
      return domain
        .toLowerCase()
        .trim()
        .replace(/^https?:\/\//, '')
        .split('/')[0];
    }
  }

  /** Devuelve el dominio base configurado (ej: "perfil.plus"). */
  getBaseDomain(): string {
    return this.baseDomain;
  }
}
