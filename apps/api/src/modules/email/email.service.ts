import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { getVerificationEmailTemplate } from './templates/verification-email';
import { getPasswordRecoveryEmailTemplate } from './templates/recovery-email';

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

        const { html, text } = getVerificationEmailTemplate(name, verificationUrl);

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

        const { html, text } = getPasswordRecoveryEmailTemplate(name, recoveryUrl);

        return this.sendEmail({
            to: email,
            subject: '🔐 Restablecer contraseña - Mauro Mera',
            html,
            text,
        });
    }
}
