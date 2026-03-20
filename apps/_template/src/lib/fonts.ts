/**
 * ============================================================================
 * CATÁLOGO DE FUENTES SELF-HOSTED (next/font/google)
 * 
 * Todas las fuentes del catálogo White-Label se instancian aquí en build-time.
 * Next.js las descarga, optimiza y sirve desde el mismo dominio.
 * → Cero requests a fonts.googleapis.com
 * → Cero CLS (Layout Shift)
 * → Máximo puntaje en Lighthouse
 * ============================================================================
 */
import {
    Inter,
    Roboto,
    Outfit,
    Poppins,
    DM_Sans,
    Playfair_Display,
    Lora,
    JetBrains_Mono,
} from "next/font/google";

// ── Instanciar las 8 fuentes del catálogo ──────────────────────
// Cada una define la variable CSS --font-tenant para sobreescribir la fuente base.

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-tenant",
    display: "swap",
});

const roboto = Roboto({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    variable: "--font-tenant",
    display: "swap",
});

const outfit = Outfit({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-tenant",
    display: "swap",
});

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-tenant",
    display: "swap",
});

const dmSans = DM_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    variable: "--font-tenant",
    display: "swap",
});

const playfairDisplay = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-tenant",
    display: "swap",
});

const lora = Lora({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    variable: "--font-tenant",
    display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    variable: "--font-tenant",
    display: "swap",
});

// ── Diccionario: string de BD → instancia next/font ──────────
// El key DEBE coincidir EXACTAMENTE con los valores del FONT_CATALOG
// definido en @alvarosky/features/constants/brand-catalog.ts

interface FontEntry {
    /** CSS variable class (ej: la que inyecta --font-tenant) */
    variable: string;
    /** Nombre de la font-family real para usar en --font-sans */
    family: string;
}

export const FONT_CLASS_MAP: Record<string, FontEntry> = {
    "Inter": { variable: inter.variable, family: "Inter" },
    "Roboto": { variable: roboto.variable, family: "Roboto" },
    "Outfit": { variable: outfit.variable, family: "Outfit" },
    "Poppins": { variable: poppins.variable, family: "Poppins" },
    "DM Sans": { variable: dmSans.variable, family: "'DM Sans'" },
    "Playfair Display": { variable: playfairDisplay.variable, family: "'Playfair Display'" },
    "Lora": { variable: lora.variable, family: "Lora" },
    "JetBrains Mono": { variable: jetbrainsMono.variable, family: "'JetBrains Mono'" },
};

/**
 * Obtiene la clase CSS variable y la font-family para una fuente del catálogo.
 * Si la fuente no está en el catálogo, usa Inter como fallback.
 */
export function getTenantFont(fontFamily: string | undefined | null): FontEntry {
    const key = fontFamily?.split(",")[0]?.trim() || "Inter";
    return FONT_CLASS_MAP[key] || FONT_CLASS_MAP["Inter"];
}
