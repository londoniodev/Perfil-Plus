import * as React from 'react';
import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Hr,
} from '@react-email/components';

interface EmailLayoutProps {
    children: React.ReactNode;
    preview?: string;
}

export const EmailLayout: React.FC<EmailLayoutProps> = ({
    children,
    preview = '',
}) => {
    const currentYear = new Date().getFullYear();

    return (
        <Html>
            <Head />
            {preview && <Text style={{ display: 'none' }}>{preview}</Text>}
            <Body style={styles.body}>
                <Container style={styles.container}>
                    {/* Header */}
                    <Section style={styles.header}>
                        <Text style={styles.headerTitle}>Mauro Mera</Text>
                        <Text style={styles.headerSubtitle}>
                            Psicología • Mentoría • Liderazgo
                        </Text>
                    </Section>

                    {/* Content */}
                    <Section style={styles.content}>{children}</Section>

                    {/* Footer */}
                    <Section style={styles.footer}>
                        <Text style={styles.footerText}>
                            © {currentYear} Mauro Mera. Todos los derechos reservados.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

const styles = {
    body: {
        fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        backgroundColor: '#f4f4f5',
        margin: 0,
        padding: '40px 20px',
    },
    container: {
        maxWidth: '560px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden' as const,
    },
    header: {
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        padding: '40px 40px 30px',
        textAlign: 'center' as const,
    },
    headerTitle: {
        color: '#ffffff',
        margin: 0,
        fontSize: '28px',
        fontWeight: 700,
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.9)',
        margin: '8px 0 0',
        fontSize: '14px',
    },
    content: {
        padding: '40px',
    },
    footer: {
        backgroundColor: '#fafafa',
        padding: '24px 40px',
        textAlign: 'center' as const,
        borderTop: '1px solid #e4e4e7',
    },
    footerText: {
        color: '#a1a1aa',
        fontSize: '12px',
        margin: 0,
    },
};

export default EmailLayout;

