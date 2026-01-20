import styles from "@/styles/admin.module.css";
import { IconStar, IconCheck, IconEye, IconEyeOff } from "@alvarosky/ui";

interface ToggleButtonProps {
    active: boolean;
    onClick: () => void;
    label: string;
    activeColor?: string;
    icon: React.ReactNode;
    activeIcon?: React.ReactNode;
}

/**
 * Botón toggle reutilizable con estilo visual activo/inactivo.
 * Usado para estados como Premium/Publicado.
 */
export default function ToggleButton({
    active,
    onClick,
    label,
    activeColor = "#8b5cf6",
    icon,
    activeIcon,
}: ToggleButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={styles.toggleBtn}
            style={{
                background: active ? `${activeColor}26` : "transparent",
                borderColor: active ? activeColor : "var(--border)",
                color: active ? activeColor : "var(--foreground-muted)",
            }}
        >
            {active && activeIcon ? activeIcon : icon}
            <span style={{ fontWeight: 500 }}>{label}</span>
        </button>
    );
}

// Iconos predefinidos para uso común
export const PremiumIcon = ({ filled = false, color = "currentColor" }: { filled?: boolean; color?: string }) => (
    <IconStar
        fill={filled ? color : "none"}
        color={color}
        size={18}
    />
);

export const PublishIcon = ({ published = false }: { published?: boolean }) => (
    published ? <IconCheck color="#22c55e" size={18} /> : <IconEyeOff size={18} />
);

