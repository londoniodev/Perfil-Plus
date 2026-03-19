/**
 * Motor de Marca Blanca - Utilidades de Conversión de Color
 * Convierte HEX a formato HSL de Shadcn (sin wrapper "hsl()").
 */

/**
 * Convierte un color HEX (#RRGGBB o #RGB) al formato HSL de Shadcn: "H S% L%"
 * @example hexToHsl("#1D4ED8") → "224 76% 48%"
 */
export function hexToHsl(hex: string): string {
    const sanitized = hex.replace('#', '');

    let r: number, g: number, b: number;

    if (sanitized.length === 3) {
        r = parseInt(sanitized[0] + sanitized[0], 16);
        g = parseInt(sanitized[1] + sanitized[1], 16);
        b = parseInt(sanitized[2] + sanitized[2], 16);
    } else {
        r = parseInt(sanitized.substring(0, 2), 16);
        g = parseInt(sanitized.substring(2, 4), 16);
        b = parseInt(sanitized.substring(4, 6), 16);
    }

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
                break;
            case g:
                h = ((b - r) / d + 2) * 60;
                break;
            case b:
                h = ((r - g) / d + 4) * 60;
                break;
        }
    }

    return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Calcula el foreground HSL con contraste WCAG adecuado para un color de fondo HEX.
 * Usa luminancia relativa para decidir si el foreground debe ser claro u oscuro.
 * 
 * @example getContrastForegroundHsl("#1D4ED8") → "0 0% 98%"  (blanco sobre azul oscuro)
 * @example getContrastForegroundHsl("#FACC15") → "0 0% 9%"   (negro sobre amarillo claro)
 */
export function getContrastForegroundHsl(hex: string): string {
    const sanitized = hex.replace('#', '');

    let r: number, g: number, b: number;

    if (sanitized.length === 3) {
        r = parseInt(sanitized[0] + sanitized[0], 16);
        g = parseInt(sanitized[1] + sanitized[1], 16);
        b = parseInt(sanitized[2] + sanitized[2], 16);
    } else {
        r = parseInt(sanitized.substring(0, 2), 16);
        g = parseInt(sanitized.substring(2, 4), 16);
        b = parseInt(sanitized.substring(4, 6), 16);
    }

    // Calcular luminancia relativa (WCAG 2.0)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Si el fondo es claro (luminance > 0.5), usar foreground oscuro; si es oscuro, usar foreground claro
    return luminance > 0.5 ? '0 0% 9%' : '0 0% 98%';
}
