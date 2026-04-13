import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../../prisma/prisma.service';
import { OpenAI } from 'openai';

@Injectable()
export class MetaApiService {
  private readonly logger = new Logger(MetaApiService.name);
  private readonly apiUrl = 'https://graph.facebook.com/v21.0';
  private openai: OpenAI;

  constructor(private readonly prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Obtiene el access token de WhatsApp desde TenantSettings.
   */
  private async getAccessToken(tenantId: string): Promise<string | null> {
    const tenantSettings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
    });
    return tenantSettings?.waAccessToken || null;
  }

  /**
   * Marca un mensaje como leído (double-check azul) — UX instantáneo.
   */
  async markAsRead(
    tenantId: string,
    phoneNumberId: string,
    messageId: string,
  ): Promise<void> {
    try {
      const accessToken = await this.getAccessToken(tenantId);
      if (!accessToken) return;

      await axios.post(
        `${this.apiUrl}/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      // Fire-and-forget: no bloquear el flujo por un mark_as_read
      this.logger.debug(
        `[Tenant: ${tenantId}] mark_as_read falló (no crítico): ${error.message}`,
      );
    }
  }

  async sendTextMessage(
    tenantId: string,
    phoneNumberId: string,
    to: string,
    text: string,
  ): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken(tenantId);

      if (!accessToken) {
        this.logger.error(
          `[Tenant: ${tenantId}] waAccessToken no configurado en TenantSettings. No se puede enviar el mensaje.`,
        );
        return false;
      }

      const url = `${this.apiUrl}/${phoneNumberId}/messages`;

      await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: {
            preview_url: false,
            body: text,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(
        `[Tenant: ${tenantId}] Mensaje enviado exitosamente a ${to}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `[Tenant: ${tenantId}] Error enviando mensaje a Meta: ${
          error.response?.data?.error?.message || error.message
        }`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Envía una imagen por WhatsApp con caption opcional.
   */
  async sendImageMessage(
    tenantId: string,
    phoneNumberId: string,
    to: string,
    imageUrl: string,
    caption?: string,
  ): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken(tenantId);
      if (!accessToken) {
        this.logger.error(
          `[Tenant: ${tenantId}] waAccessToken no configurado. No se puede enviar imagen.`,
        );
        return false;
      }

      await axios.post(
        `${this.apiUrl}/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'image',
          image: {
            link: imageUrl,
            ...(caption ? { caption } : {}),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(
        `[Tenant: ${tenantId}] Imagen enviada a ${to}: ${imageUrl.substring(0, 60)}...`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `[Tenant: ${tenantId}] Error enviando imagen: ${
          error.response?.data?.error?.message || error.message
        }`,
      );
      return false;
    }
  }

  /**
   * Descarga un audio de Meta y lo transcribe con OpenAI Whisper.
   * Meta entrega audios en OGG; se construye FormData con filename forzado.
   */
  async transcribeAudio(
    tenantId: string,
    mediaId: string,
  ): Promise<string | null> {
    try {
      const accessToken = await this.getAccessToken(tenantId);
      if (!accessToken) {
        this.logger.error(
          `[Tenant: ${tenantId}] waAccessToken no configurado. No se puede descargar audio.`,
        );
        return null;
      }

      // Paso 1: Obtener la URL del media desde Graph API
      const mediaResponse = await axios.get(
        `${this.apiUrl}/${mediaId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      const mediaUrl = mediaResponse.data.url;
      if (!mediaUrl) {
        this.logger.error(
          `[Tenant: ${tenantId}] No se obtuvo URL del media ${mediaId}`,
        );
        return null;
      }

      // Paso 2: Descargar el buffer del audio
      const audioResponse = await axios.get(mediaUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
        responseType: 'arraybuffer',
      });

      const audioBuffer = Buffer.from(audioResponse.data);
      this.logger.log(
        `[Tenant: ${tenantId}] Audio descargado (${audioBuffer.length} bytes). Enviando a Whisper...`,
      );

      // Paso 3: Crear File object con nombre forzado (crítico para evitar Error 400)
      const audioFile = new File([audioBuffer], 'audio.ogg', {
        type: 'audio/ogg',
      });

      // Paso 4: Transcribir con Whisper
      const transcription = await this.openai.audio.transcriptions.create({
        model: 'whisper-1',
        file: audioFile,
        language: 'es',
      });

      this.logger.log(
        `[Tenant: ${tenantId}] Transcripción: "${transcription.text?.substring(0, 80)}..."`,
      );

      return transcription.text || null;
    } catch (error) {
      this.logger.error(
        `[Tenant: ${tenantId}] Error transcribiendo audio: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  /**
   * Envía un mensaje interactivo con botón CTA (Call-to-Action) URL.
   * El usuario verá un botón nativo de WhatsApp que lo lleva a la URL.
   */
  async sendInteractiveCtaMessage(
    tenantId: string,
    phoneNumberId: string,
    to: string,
    bodyText: string,
    buttonText: string,
    ctaUrl: string,
  ): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken(tenantId);

      if (!accessToken) {
        this.logger.error(
          `[Tenant: ${tenantId}] waAccessToken no configurado en TenantSettings. No se puede enviar el mensaje interactivo.`,
        );
        return false;
      }

      const url = `${this.apiUrl}/${phoneNumberId}/messages`;

      // Truncar buttonText a 20 chars (límite de WhatsApp)
      const safeButtonText = buttonText.substring(0, 20);

      await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'interactive',
          interactive: {
            type: 'cta_url',
            body: {
              text: bodyText,
            },
            action: {
              name: 'cta_url',
              parameters: {
                display_text: safeButtonText,
                url: ctaUrl,
              },
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(
        `[Tenant: ${tenantId}] Mensaje interactivo CTA enviado a ${to}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `[Tenant: ${tenantId}] Error enviando mensaje interactivo CTA a Meta: ${
          error.response?.data?.error?.message || error.message
        }`,
        error.stack,
      );
      // Fallback: intentar enviar como texto plano
      this.logger.warn(
        `[Tenant: ${tenantId}] Intentando fallback a texto plano...`,
      );
      return this.sendTextMessage(
        tenantId,
        phoneNumberId,
        to,
        `${bodyText}\n\n${ctaUrl}`,
      );
    }
  }
}
