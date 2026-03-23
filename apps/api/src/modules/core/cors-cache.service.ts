import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CorsCacheService implements OnModuleInit {
  private readonly logger = new Logger(CorsCacheService.name);
  private readonly allowedOrigins = new Set<string>();
  private readonly baseDomain: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.baseDomain =
      this.configService.get<string>('NEXT_PUBLIC_BASE_DOMAIN') ||
      'xn--alvarolondoo-khb.dev';
  }

  async onModuleInit() {
    await this.loadOriginsFromDb();
  }

  /**
   * Carga todos los dominios existentes de tenants en la caché RAM.
   * Se ejecuta una sola vez al iniciar el módulo.
   */
  private async loadOriginsFromDb(): Promise<void> {
    try {
      const tenants = await this.prisma.tenant.findMany({
        select: { slug: true, domain: true },
      });

      for (const tenant of tenants) {
        // Subdomain origin: https://{slug}.{baseDomain}
        if (tenant.slug) {
          this.allowedOrigins.add(
            `https://${tenant.slug}.${this.baseDomain}`,
          );
        }

        // Custom domain origin: https://{domain}
        if (tenant.domain) {
          this.allowedOrigins.add(`https://${tenant.domain}`);
        }
      }

      this.logger.log(
        `CORS Cache inicializado con ${this.allowedOrigins.size} orígenes de ${tenants.length} tenants`,
      );
    } catch (error: any) {
      this.logger.error(
        `Error cargando orígenes CORS desde la DB: ${error.message}`,
      );
    }
  }

  /**
   * Agrega un nuevo origen al caché en RAM (sin reiniciar el servidor).
   * Se llama después de crear un nuevo Tenant.
   */
  addOrigin(origin: string): void {
    this.allowedOrigins.add(origin);
    this.logger.log(`Nuevo origen CORS agregado al caché: ${origin}`);
  }

  /**
   * Verifica si un origen está permitido en la caché RAM.
   */
  checkOrigin(origin: string): boolean {
    return this.allowedOrigins.has(origin);
  }

  /**
   * Devuelve el dominio base configurado.
   */
  getBaseDomain(): string {
    return this.baseDomain;
  }
}
