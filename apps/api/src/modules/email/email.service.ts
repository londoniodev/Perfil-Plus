import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

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

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifica tu email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
    <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Mauro Mera</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Psicología • Mentoría • Liderazgo</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px;">
            <h2 style="color: #18181b; margin: 0 0 16px; font-size: 22px;">¡Hola ${name}!</h2>
            
            <p style="color: #52525b; line-height: 1.6; margin: 0 0 24px;">
                Gracias por registrarte. Para completar tu registro y acceder a todos los contenidos, 
                por favor verifica tu dirección de email haciendo clic en el botón:
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="${verificationUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Verificar mi email
                </a>
            </div>
            
            <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
                Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
            </p>
            <p style="color: #6366f1; font-size: 13px; word-break: break-all; margin: 8px 0 0;">
                ${verificationUrl}
            </p>
            
            <div style="border-top: 1px solid #e4e4e7; margin-top: 32px; padding-top: 24px;">
                <p style="color: #a1a1aa; font-size: 13px; margin: 0;">
                    ⏰ Este enlace expira en 24 horas.<br>
                    Si no solicitaste este email, puedes ignorarlo.
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #fafafa; padding: 24px 40px; text-align: center; border-top: 1px solid #e4e4e7;">
            <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Mauro Mera. Todos los derechos reservados.
            </p>
        </div>
    </div>
</body>
</html>
        `;

        const text = `
¡Hola ${name}!

Gracias por registrarte en Mauro Mera. Para completar tu registro, verifica tu email visitando este enlace:

${verificationUrl}

Este enlace expira en 24 horas.

Si no solicitaste este email, puedes ignorarlo.

© ${new Date().getFullYear()} Mauro Mera
        `;

        return this.sendEmail({
            to: email,
            subject: '✉️ Verifica tu email - Mauro Mera',
            html,
            text,
        });
    }
}
