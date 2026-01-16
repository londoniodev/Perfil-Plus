import * as React from 'react';
import { Text, Section, Hr } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { EmailButton } from './components/EmailButton';

interface SubscriptionSuccessEmailProps {
    name: string;
    planName: string;
    endDate: string;
}

export const SubscriptionSuccessEmail: React.FC<SubscriptionSuccessEmailProps> = ({
    name,
    planName,
    endDate,
}) => {
    return (
        <EmailLayout preview="¡Tu suscripción está activa! Bienvenido a la comunidad">
            <Text style={styles.greeting}>¡Bienvenido {name}!</Text>

            <Text style={styles.paragraph}>
                Tu suscripción <strong>{planName}</strong> ha sido activada exitosamente.
                Ya tienes acceso completo a todos los cursos, contenido premium y evaluaciones.
            </Text>

            <Section style={styles.detailsBox}>
                <Text style={styles.detailsTitle}>Detalles de tu suscripción</Text>
                <Text style={styles.detailsItem}>Plan: {planName}</Text>
                <Text style={styles.detailsItem}>Válido hasta: {endDate}</Text>
            </Section>

            <Section style={styles.buttonContainer}>
                <EmailButton href="https://mauromera.com/cursos">Ir a mis cursos</EmailButton>
            </Section>

            <Hr style={styles.divider} />

            <Text style={styles.notice}>
                Nota: Puedes gestionar tu suscripción desde tu panel de usuario en cualquier momento.
                <br />
                Si tienes alguna duda, no dudes en contactarnos.
            </Text>
        </EmailLayout>
    );
};

const styles = {
    greeting: {
        color: '#18181b',
        margin: '0 0 16px',
        fontSize: '24px',
        fontWeight: 600,
    },
    paragraph: {
        color: '#52525b',
        lineHeight: 1.6,
        margin: '0 0 24px',
        fontSize: '16px',
    },
    detailsBox: {
        backgroundColor: '#f9fafb',
        border: '1px solid #e4e4e7',
        borderRadius: '8px',
        padding: '20px',
        margin: '24px 0',
    },
    detailsTitle: {
        color: '#18181b',
        fontSize: '16px',
        fontWeight: 600,
        margin: '0 0 12px',
    },
    detailsItem: {
        color: '#52525b',
        fontSize: '15px',
        margin: '8px 0',
    },
    buttonContainer: {
        textAlign: 'center' as const,
        margin: '32px 0',
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

export default SubscriptionSuccessEmail;
