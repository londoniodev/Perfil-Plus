import { Injectable, Logger, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
// import * as nodemailer from 'nodemailer'; // Lazy loaded
import type { Request } from 'express';
// import { render } from '@react-email/render'; // Lazy loaded
import { VerificationEmail } from './emails/VerificationEmail';
import { RecoveryEmail } from './emails/RecoveryEmail';
import { SubscriptionSuccessEmail } from './emails/SubscriptionSuccessEmail';
import { DigitalPurchaseEmail } from './emails/DigitalPurchaseEmail';
import * as React from 'react';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface SmtpConfig {
  host: string;
  port: number;
  secure?: boolean;
  user: string;
  pass: string;
  from: string;
}

@Injectable({ scope: Scope.REQUEST })
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject(REQUEST) private request: Request,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  private getTenantId(): string {
    return (
      (this.request as any).tenantId ||
      (this.request.headers['x-tenant-id'] as string) ||
      'default'
    );
  }

  private async getFrontendUrl(): Promise<string> {
    // 1. Intentar obtener de la configuración del Tenant (DB)
    try {
      const setting = await this.prisma.systemSetting.findFirst({
        where: { tenantId: this.getTenantId(), key: 'FRONTEND_URL' },
      });
      if (typeof setting?.value === 'string') {
        return setting.value;
      }
    } catch (error) {
      this.logger.warn('Error fetching FRONTEND_URL from DB', error);
    }

    // 2. Intentar obtener el Origin del request (Fallback dinámico)
    const origin = this.request.headers['origin'];
    if (origin) {
      return origin;
    }

    // 3. Fallback a variable de entorno global
    return this.configService.get('FRONTEND_URL', 'http://localhost:3000');
  }

  private async getTransporter(): Promise<{ transporter: any; from: string }> {
    // Dynamic import
    const nodemailer = await import('nodemailer');

    // 1. Intentar obtener configuración de la DB
    let smtpConfig: SmtpConfig | null = null;

    try {
      const setting = await this.prisma.systemSetting.findFirst({
        where: { tenantId: this.getTenantId(), key: 'SMTP_CONFIG' },
      });

      if (setting?.value) {
        // Validación básica del JSON
        const value = setting.value as any;
        if (value.host && value.user && value.pass) {
          smtpConfig = {
            host: value.host,
            port: Number(value.port) || 465,
            secure: value.secure ?? true,
            user: value.user,
            pass: value.pass,
            from: value.from || `No Reply <${value.user}>`,
          };
          this.logger.debug('Usando configuración SMTP de la base de datos');
        }
      }
    } catch (error) {
      this.logger.warn(
        'Error al leer configuración SMTP de DB, usando fallback',
        error,
      );
    }

    // 2. Fallback a variables de entorno
    if (!smtpConfig) {
      const envHost = this.configService.get('SMTP_HOST');
      const envUser = this.configService.get('SMTP_USER');
      const envPass = this.configService.get('SMTP_PASS');

      if (envHost && envUser && envPass) {
        smtpConfig = {
          host: envHost,
          port: this.configService.get('SMTP_PORT', 465),
          secure: true,
          user: envUser,
          pass: envPass,
          from: this.configService.get('SMTP_FROM', `Mauro Mera <${envUser}>`),
        };
        this.logger.debug('Usando configuración SMTP de variables de entorno');
      }
    }

    // 3. Fallo total
    if (!smtpConfig) {
      throw new Error('No SMTP configuration found for this tenant');
    }

    // Crear transporter
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });

    return { transporter, from: smtpConfig.from };
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      const { transporter, from } = await this.getTransporter();

      await transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      this.logger.log(`Email enviado a ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Error enviando email a ${options.to}:`, error);
      return false;
    }
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    verificationToken: string,
  ): Promise<boolean> {
    const frontendUrl = await this.getFrontendUrl();
    const verificationUrl = `${frontendUrl}/verificar-email?token=${verificationToken}`;

    const { render } = await import('@react-email/render');
    const html = await render(
      VerificationEmail({ name, url: verificationUrl }),
    );
    const text = `¡Hola ${name}!\n\nGracias por registrarte. Verifica tu email: ${verificationUrl}\n\nEste enlace expira en 24 horas.`;

    return this.sendEmail({
      to: email,
      subject: '✉️ Verifica tu email - Mauro Mera',
      html,
      text,
    });
  }

  async sendPasswordRecoveryEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<boolean> {
    const frontendUrl = await this.getFrontendUrl();
    const recoveryUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

    const { render } = await import('@react-email/render');
    const html = await render(RecoveryEmail({ name, url: recoveryUrl }));
    const text = `¡Hola ${name}!\n\nHemos recibido una solicitud para restablecer tu contraseña.\nVisita: ${recoveryUrl}\n\nEste enlace expira en 1 hora.`;

    return this.sendEmail({
      to: email,
      subject: '🔐 Restablecer contraseña - Mauro Mera',
      html,
      text,
    });
  }

  async sendSubscriptionSuccessEmail(
    email: string,
    name: string,
    planName: string,
    endDate: Date,
  ): Promise<boolean> {
    const formattedEndDate = new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      dayPeriod: undefined,
    } as Intl.DateTimeFormatOptions).format(endDate);

    const frontendUrl = await this.getFrontendUrl();
    const { render } = await import('@react-email/render');
    const html = await render(
      SubscriptionSuccessEmail({
        name,
        planName,
        endDate: formattedEndDate,
        frontendUrl,
      }),
    );

    const text = `¡Bienvenido ${name}!\n\nTu suscripción ${planName} ha sido activada exitosamente.\nVálida hasta: ${formattedEndDate}\n\nYa puedes acceder a todos los cursos en: ${frontendUrl}/cursos`;

    return this.sendEmail({
      to: email,
      subject: '¡Tu suscripción está activa! - Mauro Mera',
      html,
      text,
    });
  }

  async sendDigitalPurchaseEmail(
    email: string,
    name: string,
    productTitle: string,
    productSlug: string,
  ): Promise<boolean> {
    const frontendUrl = await this.getFrontendUrl();
    const { render } = await import('@react-email/render');
    const html = await render(
      DigitalPurchaseEmail({
        name,
        ebookTitle: productTitle,
        ebookSlug: productSlug,
        frontendUrl,
      }),
    );

    const productUrl = `${frontendUrl}/compras`;

    const text = `¡Gracias por tu compra, ${name}!\n\nYa puedes acceder a tu producto digital: ${productTitle}\n\nVer ahora: ${productUrl}`;

    return this.sendEmail({
      to: email,
      subject: `Tu compra fue exitosa: ${productTitle} - Mauro Mera`,
      html,
      text,
    });
  }
  async sendDigitalDelivery(
    email: string,
    name: string,
    items: { productName: string; downloadUrl: string }[],
  ): Promise<boolean> {
    const frontendUrl = await this.getFrontendUrl();

    // Formato básico en HTML dado que estamos enviando un arreglo dinámico de links.
    // Podría mejorarse integrando un React Template específico luego.
    const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2>¡Gracias por tu compra, ${name}!</h2>
                <p>Ya puedes acceder a tus productos digitales. Aquí tienes los enlaces de descarga directa (válidos por 24 horas):</p>
                <ul style="background: #f4f4f5; padding: 20px; border-radius: 8px; list-style-type: none;">
                    ${items.map((item) => `<li style="margin-bottom: 10px;"><strong>${item.productName}</strong><br/><a href="${item.downloadUrl}" style="color: #2563eb; text-decoration: none;">⬇️ Descargar Archivo</a></li>`).join('')}
                </ul>
                <p style="margin-top: 30px;">Si necesitas volver a descargar, puedes ver tus compras en cualquier momento desde tu cuenta:</p>
                <a href="${frontendUrl}/compras" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px;">Ver mis compras</a>
                <p style="margin-top: 20px; font-size: 12px; color: #666;">Si tienes problemas para acceder a los archivos, responde a este correo.</p>
            </div>
        `;

    const text = `¡Gracias por tu compra, ${name}!\n\nYa puedes acceder a tus productos digitales. Aquí tienes los enlaces de descarga (válidos por 24 horas):\n\n${items.map((item) => `- ${item.productName}: ${item.downloadUrl}`).join('\n')}\n\nVer mis compras: ${frontendUrl}/compras`;

    return this.sendEmail({
      to: email,
      subject: '⬇️ Tus productos digitales están listos - Mauro Mera',
      html,
      text,
    });
  }
}
