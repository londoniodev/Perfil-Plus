export const getPasswordRecoveryEmailTemplate = (name: string, url: string) => {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recupera tu contraseña</title>
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
                Hemos recibido una solicitud para restablecer tu contraseña. Si fuiste tú,
                haz clic en el siguiente botón para crear una nueva contraseña:
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="${url}" 
                   style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Restablecer Contraseña
                </a>
            </div>
            
            <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
                Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
            </p>
            <p style="color: #6366f1; font-size: 13px; word-break: break-all; margin: 8px 0 0;">
                ${url}
            </p>
            
            <div style="border-top: 1px solid #e4e4e7; margin-top: 32px; padding-top: 24px;">
                <p style="color: #a1a1aa; font-size: 13px; margin: 0;">
                    ⏰ Este enlace expira en 1 hora.<br>
                    Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
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

Hemos recibido una solicitud para restablecer tu contraseña.
Para continuar, visita el siguiente enlace:

${url}

Este enlace expira en 1 hora.

Si no solicitaste este cambio, puedes ignorar este correo.

© ${new Date().getFullYear()} Mauro Mera
    `;

    return { html, text };
};
