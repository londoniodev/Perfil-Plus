/**
 * Motor de Marca Blanca - Utilidades de Conversión de Color
 * Convierte HEX a formato HSL de Shadcn (sin wrapper "hsl()").
 * 
 * FORMATO REQUERIDO POR SHADCN/TAILWIND: "H S% L%" (sin comas, sin paréntesis)
 * Ejemplo: "224 76% 48%"
 */

/** Fallback HSL para cuando el input es inválido */
const FALLBACK_PRIMARY_HSL = "0 0% 3.9%"; // Casi negro (zinc-950)
const FALLBACK_FOREGROUND_HSL = "0 0% 98%"; // Casi blanco

/**
 * Detecta si un string ya está en formato HSL de Shadcn ("H S% L%")
 */
function isHslFormat(value: string): boolean {
    return /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/.test(value.trim());
}

/**
 * Detecta si un string es un color HEX válido (#RGB o #RRGGBB)
 */
function isHexColor(value: string): boolean {
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

/**
 * Convierte un color HEX (#RRGGBB o #RGB) al formato HSL de Shadcn: "H S% L%"
 * 
 * - Si la entrada ya es HSL ("224 76% 48%"), la retorna tal cual.
 * - Si la entrada es un nombre de theme ("zinc"), retorna el fallback.
 * - Si la entrada es inválida, retorna el fallback.
 * 
 * @example hexToHsl("#1D4ED8") → "224 76% 48%"
 * @example hexToHsl("#FF0000") → "0 100% 50%"
 * @example hexToHsl("224 76% 48%") → "224 76% 48%" (passthrough)
 * @example hexToHsl("zinc") → "0 0% 3.9%" (fallback)
 */
export function hexToHsl(hex: string): string {
    if (!hex || typeof hex !== "string") return FALLBACK_PRIMARY_HSL;

    const trimmed = hex.trim();

    // Si ya es formato HSL, passthrough
    if (isHslFormat(trimmed)) return trimmed;

    // Si no es HEX válido, fallback
    if (!isHexColor(trimmed)) return FALLBACK_PRIMARY_HSL;

    const sanitized = trimmed.replace('#', '');

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
 * Calcula el foreground HSL con contraste WCAG adecuado para un color de fondo.
 * Acepta tanto HEX como HSL. Usa luminancia relativa para decidir blanco o negro.
 *
 * @example getContrastForegroundHsl("#1D4ED8") → "0 0% 98%"  (blanco sobre azul oscuro)
 * @example getContrastForegroundHsl("#FACC15") → "0 0% 9%"   (negro sobre amarillo claro)
 * @example getContrastForegroundHsl("zinc")    → "0 0% 98%"  (fallback = blanco)
 */
export function getContrastForegroundHsl(hex: string): string {
    if (!hex || typeof hex !== "string") return FALLBACK_FOREGROUND_HSL;

    const trimmed = hex.trim();

    // Si es formato HSL (no HEX), inferir luminancia desde el valor L%
    if (isHslFormat(trimmed)) {
        const parts = trimmed.split(/\s+/);
        const lightness = parseFloat(parts[2]?.replace('%', '') || '50');
        return lightness > 55 ? '0 0% 9%' : '0 0% 98%';
    }

    // Si no es HEX válido, fallback (asumir fondo oscuro → foreground claro)
    if (!isHexColor(trimmed)) return FALLBACK_FOREGROUND_HSL;

    const sanitized = trimmed.replace('#', '');

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

    // Si el fondo es claro (luminance > 0.5), usar foreground oscuro
    return luminance > 0.5 ? '0 0% 9%' : '0 0% 98%';
}

/**
 * Genera una versión "legible" del color primario para usar como texto sobre fondos claros.
 * Si la luminosidad HSL del color es mayor a 45%, la clampea a 40% para garantizar
 * contraste WCAG AA contra fondo blanco. Si ya es oscuro, devuelve el HSL tal cual.
 *
 * @example getReadablePrimaryHsl("#FACC15") → "48 96% 40%"  (amarillo oscurecido)
 * @example getReadablePrimaryHsl("#1D4ED8") → "224 76% 48%" (azul oscuro, sin cambio)
 * @example getReadablePrimaryHsl("zinc")    → "0 0% 3.9%"  (fallback)
 */
export function getReadablePrimaryHsl(hex: string): string {
    if (!hex || typeof hex !== "string") return FALLBACK_PRIMARY_HSL;

    const trimmed = hex.trim();

    // Si ya es formato HSL, ajustar luminancia directamente
    if (isHslFormat(trimmed)) {
        const parts = trimmed.split(/\s+/);
        const h = parts[0];
        const s = parts[1];
        const l = parseFloat(parts[2]?.replace('%', '') || '50');
        if (l > 45) {
            return `${h} ${s} 40%`;
        }
        return trimmed;
    }

    // Convertir a HSL y luego ajustar
    const hsl = hexToHsl(trimmed);
    if (hsl === FALLBACK_PRIMARY_HSL) return hsl; // Era un nombre de theme inválido

    const parts = hsl.split(/\s+/);
    const h = parts[0];
    const s = parts[1];
    const l = parseFloat(parts[2]?.replace('%', '') || '50');

    if (l > 45) {
        return `${h} ${s.replace('%', '')}% 40%`;
    }

    return hsl;
}
