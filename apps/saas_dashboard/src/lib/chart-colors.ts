/**
 * Genera colores degradados basados en el color primario del tema.
 * El valor más grande recibe el color al 100% de opacidad,
 * los demás se aclaran progresivamente.
 *
 * @param count - Número de colores a generar
 * @param minOpacity - Opacidad mínima (default 0.25)
 * @returns Array de strings CSS `hsl(var(--primary) / opacity)`
 */
export function generateThemeColors(count: number, minOpacity = 0.25): string[] {
    if (count <= 0) return [];
    if (count === 1) return ["hsl(var(--primary))"];

    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
        const opacity = 1 - (i * (1 - minOpacity)) / (count - 1);
        colors.push(`hsl(var(--primary) / ${opacity.toFixed(2)})`);
    }
    return colors;
}

/**
 * Devuelve el label legible para un período del selector de tiempo.
 */
export function getPeriodLabel(period: string): string {
    const labels: Record<string, string> = {
        today: "hoy",
        "7d": "los últimos 7 días",
        "30d": "los últimos 30 días",
        "3m": "los últimos 3 meses",
        "6m": "los últimos 6 meses",
        "1y": "este año",
    };
    return labels[period] || "el período seleccionado";
}
