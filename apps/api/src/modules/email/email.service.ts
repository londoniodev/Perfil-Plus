import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST', 'smtp.hostinger.com'),
            port: this.configService.get('SMTP_PORT', 465),
            secure: true, // true for 465, false for other ports
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
        });
    }

    async sendEmail(options: SendEmailOptions): Promise<boolean> {
        try {
            const from = this.configService.get(
                'SMTP_FROM',
                'Mauro Mera <noreply@mauromera.com>',
            );

            await this.transporter.sendMail({
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
        }).format(endDate);

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
