import { Injectable, Logger, Scope, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import { VerificationEmail } from './emails/VerificationEmail';
import { RecoveryEmail } from './emails/RecoveryEmail';
import { SubscriptionSuccessEmail } from './emails/SubscriptionSuccessEmail';
import { EbookPurchaseEmail } from './emails/EbookPurchaseEmail';

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
        private configService: ConfigService,
        private prisma: PrismaService,
    ) { }

    private async getTransporter(): Promise<{ transporter: nodemailer.Transporter; from: string }> {
        // 1. Intentar obtener configuración de la DB
        let smtpConfig: SmtpConfig | null = null;

        try {
            const setting = await this.prisma.client.systemSetting.findUnique({
                where: { key: 'SMTP_CONFIG' },
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
            this.logger.warn('Error al leer configuración SMTP de DB, usando fallback', error);
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
            // No relanzamos el error para no romper el flujo principal si el email falla
            return false;
        }
    }

    async sendVerificationEmail(
        email: string,
        name: string,
        verificationToken: string,
    ): Promise<boolean> {
        const frontendUrl = this.configService.get(
            'FRONTEND_URL',
            'http://localhost:3000',
        );
        const verificationUrl = `${frontendUrl}/verificar-email?token=${verificationToken}`;

        const html = await render(VerificationEmail({ name, url: verificationUrl }));
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
        const frontendUrl = this.configService.get(
            'FRONTEND_URL',
            'http://localhost:3000',
        );
        const recoveryUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

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
            dayPeriod: undefined
        } as Intl.DateTimeFormatOptions).format(endDate);

        const html = await render(
            SubscriptionSuccessEmail({
                name,
                planName,
                endDate: formattedEndDate,
            }),
        );

        const text = `¡Bienvenido ${name}!\n\nTu suscripción ${planName} ha sido activada exitosamente.\nVálida hasta: ${formattedEndDate}\n\nYa puedes acceder a todos los cursos en: https://mauromera.com/cursos`;

        return this.sendEmail({
            to: email,
            subject: '¡Tu suscripción está activa! - Mauro Mera',
            html,
            text,
        });
    }

    async sendEbookPurchaseEmail(
        email: string,
        name: string,
        ebookTitle: string,
        ebookSlug: string,
    ): Promise<boolean> {
        const html = await render(
            EbookPurchaseEmail({
                name,
                ebookTitle,
                ebookSlug,
            }),
        );

        const text = `¡Gracias por tu compra, ${name}!\n\nYa puedes acceder a tu e-book: ${ebookTitle}\n\nLeer ahora: https://mauromera.com/ebooks/${ebookSlug}`;

        return this.sendEmail({
            to: email,
            subject: `Tu compra fue exitosa: ${ebookTitle} - Mauro Mera`,
            html,
            text,
        });
    }
}
