/**
 * Catálogo cerrado de fuentes soportadas por el motor White-Label.
 * NO se permiten fuentes arbitrarias para mantener la optimización
 * de carga y la consistencia visual.
 */
export const FONT_CATALOG = [
    { value: "Inter", label: "Inter", type: "Sans-serif" },
    { value: "Roboto", label: "Roboto", type: "Sans-serif" },
    { value: "Outfit", label: "Outfit", type: "Sans-serif" },
    { value: "Poppins", label: "Poppins", type: "Sans-serif" },
    { value: "DM Sans", label: "DM Sans", type: "Sans-serif" },
    { value: "Playfair Display", label: "Playfair Display", type: "Serif" },
    { value: "Lora", label: "Lora", type: "Serif" },
    { value: "JetBrains Mono", label: "JetBrains Mono", type: "Mono" },
] as const;

export type FontCatalogValue = (typeof FONT_CATALOG)[number]["value"];

/** Extraer solo los valores para validación */
export const FONT_VALUES = FONT_CATALOG.map((f) => f.value) as unknown as [string, ...string[]];

/**
 * Opciones discretas de border-radius.
 * Mapeadas directamente a rem para inyectar en `--radius`.
 */
export const RADIUS_OPTIONS = [
    { value: 0, label: "Cuadrado" },
    { value: 0.3, label: "Sutil" },
    { value: 0.5, label: "Estándar" },
    { value: 0.75, label: "Redondeado" },
    { value: 1.0, label: "Píldora" },
] as const;

export type RadiusValue = (typeof RADIUS_OPTIONS)[number]["value"];
