import { z } from "zod";

// ============================================================================
// Regex para validación estricta de HEX de 6 caracteres (#RRGGBB)
// ============================================================================
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

// ============================================================================
// Fuentes permitidas (Google Fonts soportadas por el Motor de Marca Blanca)
// ============================================================================
export const ALLOWED_FONTS = [
    "Inter, sans-serif",
    "Roboto, sans-serif",
    "Outfit, sans-serif",
    "Playfair Display, serif",
    "Poppins, sans-serif",
    "Montserrat, sans-serif",
    "Lato, sans-serif",
    "Open Sans, sans-serif",
    "Raleway, sans-serif",
    "Nunito, sans-serif",
] as const;

export const LAYOUT_TYPES = ["CLASSIC", "INSTAGRAM", "MINIMAL"] as const;

// ============================================================================
// Schema de Validación  —  Single Source of Truth
// Compartido entre Frontend (react-hook-form) y Backend (NestJS)
// ============================================================================
export const BrandSettingsSchema = z.object({
    primaryColor: z
        .string()
        .regex(hexColorRegex, "Debe ser un color HEX válido (ej. #09090b)")
        .default("#09090b"),

    secondaryColor: z
        .string()
        .regex(hexColorRegex, "Debe ser un color HEX válido (ej. #f4f4f5)")
        .default("#f4f4f5"),

    borderRadius: z
        .number()
        .min(0, "El radio mínimo es 0")
        .max(2, "El radio máximo es 2")
        .default(0.5),

    fontFamily: z
        .string()
        .refine((val) => ALLOWED_FONTS.includes(val as any), {
            message: "Fuente no permitida",
        })
        .default("Inter, sans-serif"),

    layoutType: z
        .enum(LAYOUT_TYPES, {
            message: "Tipo de layout inválido",
        })
        .default("CLASSIC"),
});

export type BrandSettingsFormValues = z.infer<typeof BrandSettingsSchema>;
