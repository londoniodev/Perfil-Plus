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
    this.apiBaseUrl =
      this.configService.get<string>('DOKPLOY_API_URL') ||
      'https://panel.xn--alvarolondoo-khb.dev/api';
    this.apiKey = this.configService.get<string>('DOKPLOY_API_KEY') || '';
  }

  /**
   * Aprovisiona un dominio en Dokploy con certificado Let's Encrypt.
   * Los errores se loguean pero NO crashean la aplicación.
   */
  async provisionDomain(
    host: string,
    applicationId: string,
  ): Promise<boolean> {
    if (!this.apiKey) {
      this.logger.warn(
        '[Dokploy] DOKPLOY_API_KEY no configurado. Saltando provisionamiento de dominio.',
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

    try {
      this.logger.log(
        `[Dokploy] Provisionando dominio: ${host} para app ${applicationId}`,
      );

      const response = await fetch(`${this.apiBaseUrl}/domain.create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'No body');
        this.logger.error(
          `[Dokploy] Error provisionando dominio ${host}: HTTP ${response.status} — ${errorBody}`,
        );
        return false;
      }

      const data = await response.json().catch(() => ({}));
      this.logger.log(
        `[Dokploy] Dominio ${host} provisionado exitosamente. Response: ${JSON.stringify(data)}`,
      );
      return true;
    } catch (error: any) {
      this.logger.error(
        `[Dokploy] Error de red provisionando dominio ${host}: ${error.message}`,
      );
      return false;
    }
  }
}
