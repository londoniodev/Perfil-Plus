import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface DokployDomainPayload {
  host: string;
  applicationId: string;
  https: boolean;
  certificateType: 'letsencrypt' | 'none' | 'custom';
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
}
