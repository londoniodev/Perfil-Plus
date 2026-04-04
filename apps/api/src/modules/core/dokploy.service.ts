import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface DokployDomainPayload {
  host: string;
  applicationId: string;
  https: boolean;
  certificateType: 'letsencrypt' | 'none' | 'custom';
}

interface DokployDomainRecord {
  domainId: string;
  host: string;
  https: boolean;
  certificateType: string;
  applicationId?: string;
  [key: string]: unknown;
}

@Injectable()
export class DokployService {
  private readonly logger = new Logger(DokployService.name);
  private readonly apiBaseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiBaseUrl = this.configService.get<string>('DOKPLOY_API_URL') || '';
    if (!this.apiBaseUrl) {
      this.logger.warn('[Dokploy] DOKPLOY_API_URL no configurado.');
    }
    this.apiKey = this.configService.get<string>('DOKPLOY_API_KEY') || '';
  }

  /**
   * Aprovisiona un dominio en Dokploy con certificado Let's Encrypt.
   * Cuenta con sistema de reintentos con Exponential Backoff para tolerar
   * reloads momentáneos de Traefik (Errores 502/504) o red inestable.
   */
  async provisionDomain(
    host: string,
    applicationId: string,
    maxRetries: number = 3,
  ): Promise<boolean> {
    if (!this.apiKey || !this.apiBaseUrl) {
      this.logger.warn(
        '[Dokploy] DOKPLOY_API_KEY o DOKPLOY_API_URL no configurados. Saltando provisionamiento de dominio.',
      );
      return false;
    }

    if (!applicationId) {
      this.logger.warn(
        '[Dokploy] applicationId no proporcionado. Saltando provisionamiento de dominio.',
      );
      return false;
    }

    const payload: DokployDomainPayload = {
      host,
      applicationId,
      https: true,
      certificateType: 'letsencrypt',
    };

    let attempt = 0;
    while (attempt < maxRetries) {
      attempt++;
      try {
        this.logger.log(
          `[Dokploy] Provisionando dominio: ${host} para app ${applicationId} (Intento ${attempt}/${maxRetries})`,
        );

        const response = await fetch(`${this.apiBaseUrl}/domain.create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorBody = await response.text().catch(() => 'No body');
          this.logger.error(
            `[Dokploy] Error provisionando dominio ${host}: HTTP ${response.status} — ${errorBody}`,
          );

          // Si es un error 5xx provocado por el proxy/servidor interno, hacemos backoff
          if (response.status >= 500 && attempt < maxRetries) {
            const backoff = attempt * 2000;
            this.logger.warn(
              `[Dokploy] Servidor interno falló. Reintentando en ${backoff}ms...`,
            );
            await new Promise((resolve) => setTimeout(resolve, backoff));
            continue;
          }

          // Para errores 400 (Bad Request), ej: "El dominio ya existe", cortamos de inmediato
          return false;
        }

        const data = await response.json().catch(() => ({}));
        this.logger.log(
          `[Dokploy] Dominio ${host} provisionado exitosamente. Response: ${JSON.stringify(data)}`,
        );
        return true;
      } catch (error: any) {
        this.logger.error(
          `[Dokploy] Excepción de red provisionando dominio ${host}: ${error.message}`,
        );

        if (attempt < maxRetries) {
          const backoff = attempt * 2000;
          this.logger.warn(
            `[Dokploy] Problema de red inestable. Reintentando en ${backoff}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }
        return false;
      }
    }
    return false;
  }

  /**
   * Obtiene todos los dominios asociados a una aplicación en Dokploy.
   * Usa GET /domain.byApplicationId?applicationId=xxx
   */
  async getDomainsByApplicationId(
    applicationId: string,
  ): Promise<DokployDomainRecord[]> {
    if (!this.apiKey || !this.apiBaseUrl) {
      this.logger.warn(
        '[Dokploy] Credenciales no configuradas. No se pueden listar dominios.',
      );
      return [];
    }

    try {
      const response = await fetch(
        `${this.apiBaseUrl}/domain.byApplicationId?applicationId=${applicationId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
          },
        },
      );

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'No body');
        this.logger.error(
          `[Dokploy] Error listando dominios para app ${applicationId}: HTTP ${response.status} — ${errorBody}`,
        );
        return [];
      }

      const domains: DokployDomainRecord[] = await response.json();
      this.logger.log(
        `[Dokploy] Se encontraron ${domains.length} dominios para app ${applicationId}.`,
      );
      return domains;
    } catch (error: any) {
      this.logger.error(
        `[Dokploy] Excepción de red listando dominios: ${error.message}`,
      );
      return [];
    }
  }

  /**
   * Elimina un dominio por su host exacto.
   *
   * Flujo seguro de 2 pasos:
   * 1. Buscar todos los dominios de la app → filtrar por host exacto → obtener domainId.
   * 2. Llamar POST /domain.delete con el domainId obtenido.
   *
   * Esto garantiza que NUNCA se elimine un dominio que no corresponda al tenant.
   */
  async removeDomainByHost(
    host: string,
    applicationId: string,
    maxRetries: number = 3,
  ): Promise<boolean> {
    if (!this.apiKey || !this.apiBaseUrl) {
      this.logger.warn(
        '[Dokploy] Credenciales no configuradas. Saltando eliminación de dominio.',
      );
      return false;
    }

    if (!applicationId) {
      return false;
    }

    // Paso 1: Obtener la lista de dominios y buscar el domainId por host exacto
    const allDomains = await this.getDomainsByApplicationId(applicationId);
    const targetDomain = allDomains.find(
      (d) => d.host.toLowerCase() === host.toLowerCase(),
    );

    if (!targetDomain) {
      this.logger.warn(
        `[Dokploy] Dominio "${host}" no encontrado en la app ${applicationId}. Ya fue eliminado o nunca existió.`,
      );
      return false;
    }

    const { domainId } = targetDomain;
    this.logger.log(
      `[Dokploy] Dominio "${host}" encontrado con ID: ${domainId}. Procediendo a eliminar...`,
    );

    // Paso 2: Eliminar con el domainId oficial
    let attempt = 0;
    while (attempt < maxRetries) {
      attempt++;
      try {
        this.logger.log(
          `[Dokploy] Eliminando dominio: ${host} (domainId: ${domainId}) (Intento ${attempt}/${maxRetries})`,
        );

        const response = await fetch(`${this.apiBaseUrl}/domain.delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
          },
          body: JSON.stringify({ domainId }),
        });

        if (!response.ok) {
          const errorBody = await response.text().catch(() => 'No body');
          this.logger.error(
            `[Dokploy] Error eliminando dominio ${host} (${domainId}): HTTP ${response.status} — ${errorBody}`,
          );

          if (response.status >= 500 && attempt < maxRetries) {
            const backoff = attempt * 2000;
            await new Promise((resolve) => setTimeout(resolve, backoff));
            continue;
          }
          return false;
        }

        this.logger.log(
          `[Dokploy] ✅ Dominio "${host}" (${domainId}) eliminado exitosamente.`,
        );
        return true;
      } catch (error: any) {
        this.logger.error(
          `[Dokploy] Excepción de red eliminando dominio ${host}: ${error.message}`,
        );

        if (attempt < maxRetries) {
          const backoff = attempt * 2000;
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }
        return false;
      }
    }
    return false;
  }
}
