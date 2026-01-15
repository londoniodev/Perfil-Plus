import * as React from 'react';
import { Button } from '@react-email/components';

interface EmailButtonProps {
    href: string;
    children: React.ReactNode;
}

export const EmailButton: React.FC<EmailButtonProps> = ({ href, children }) => {
    return (
        <Button href={href} style={styles.button}>
            {children}
        </Button>
    );
};

const styles = {
    button: {
        display: 'inline-block',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: '#ffffff',
        textDecoration: 'none',
        padding: '14px 32px',
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: '16px',
    },
};

export default EmailButton;
