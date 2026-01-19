import * as React from 'react';
import { Text, Section, Hr } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { EmailButton } from './components/EmailButton';

interface RecoveryEmailProps {
    name: string;
    url: string;
}

export const RecoveryEmail: React.FC<RecoveryEmailProps> = ({ name, url }) => {
    return (
        <EmailLayout preview="Restablece tu contraseña">
            <Text style={styles.greeting}>¡Hola {name}!</Text>

            <Text style={styles.paragraph}>
                Hemos recibido una solicitud para restablecer tu contraseña. Si fuiste
                tú, haz clic en el siguiente botón para crear una nueva contraseña:
            </Text>

            <Section style={styles.buttonContainer}>
                <EmailButton href={url}>Restablecer Contraseña</EmailButton>
            </Section>

            <Text style={styles.alternativeText}>
                Si no puedes hacer clic en el botón, copia y pega este enlace en tu
                navegador:
            </Text>
            <Text style={styles.link}>{url}</Text>

            <Hr style={styles.divider} />

            <Text style={styles.notice}>
                ⏰ Este enlace expira en 1 hora.
                <br />
                Si no solicitaste este cambio, puedes ignorar este correo de forma
                segura.
            </Text>
        </EmailLayout>
    );
};

const styles = {
    greeting: {
        color: '#18181b',
        margin: '0 0 16px',
        fontSize: '22px',
        fontWeight: 600,
    },
    paragraph: {
        color: '#52525b',
        lineHeight: 1.6,
        margin: '0 0 24px',
        fontSize: '16px',
    },
    buttonContainer: {
        textAlign: 'center' as const,
        margin: '32px 0',
    },
    alternativeText: {
        color: '#71717a',
        fontSize: '14px',
        lineHeight: 1.6,
        margin: '24px 0 0',
    },
    link: {
        color: '#6366f1',
        fontSize: '13px',
        wordBreak: 'break-all' as const,
        margin: '8px 0 0',
    },
    divider: {
        borderTop: '1px solid #e4e4e7',
        marginTop: '32px',
    },
    notice: {
        color: '#a1a1aa',
        fontSize: '13px',
        margin: '24px 0 0',
        lineHeight: 1.6,
    },
};

export default RecoveryEmail;

