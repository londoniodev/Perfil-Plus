import * as React from 'react';
import { Text, Section, Hr } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { EmailButton } from './components/EmailButton';

interface EbookPurchaseEmailProps {
    name: string;
    ebookTitle: string;
    ebookSlug: string;
    frontendUrl: string;
}

export const EbookPurchaseEmail: React.FC<EbookPurchaseEmailProps> = ({
    name,
    ebookTitle,
    ebookSlug,
    frontendUrl,
}) => {
    return (
        <EmailLayout preview={`Tu compra fue exitosa: ${ebookTitle}`}>
            <Text style={styles.greeting}>¡Gracias por tu compra, {name}!</Text>

            <Text style={styles.paragraph}>
                Tu pago ha sido procesado exitosamente. Ya puedes acceder a tu e-book:
            </Text>

            <Section style={styles.ebookBox}>
                <Text style={styles.ebookTitle}>{ebookTitle}</Text>
                <Text style={styles.ebookStatus}>Disponible ahora</Text>
            </Section>

            <Section style={styles.buttonContainer}>
                <EmailButton href={`${frontendUrl}/ebooks/${ebookSlug}`}>
                    Leer mi e-book
                </EmailButton>
            </Section>

            <Text style={styles.alternativeText}>
                También puedes acceder desde tu panel de usuario en la sección "Mis Compras".
            </Text>

            <Hr style={styles.divider} />

            <Text style={styles.notice}>
                Nota: Tu e-book estará disponible para siempre en tu cuenta.
                <br />
                Si tienes alguna duda o problema para acceder, contáctanos y te ayudaremos.
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
    ebookBox: {
        backgroundColor: '#f9fafb',
        border: '1px solid #e4e4e7',
        borderRadius: '8px',
        padding: '24px',
        margin: '24px 0',
        textAlign: 'center' as const,
    },
    ebookTitle: {
        color: '#18181b',
        fontSize: '18px',
        fontWeight: 600,
        margin: '0 0 8px',
    },
    ebookStatus: {
        color: '#10b981',
        fontSize: '14px',
        margin: 0,
    },
    buttonContainer: {
        textAlign: 'center' as const,
        margin: '32px 0',
    },
    alternativeText: {
        color: '#71717a',
        fontSize: '14px',
        lineHeight: 1.6,
        margin: '0',
        textAlign: 'center' as const,
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

export default EbookPurchaseEmail;

