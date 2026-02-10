// ============================================================================
// CENTRALIZED FONT CONFIGURATION
// Used by all apps in the monorepo for consistent typography
// ============================================================================

import { Poppins, Geist_Mono } from "next/font/google";

/**
 * Primary Sans-serif font (Poppins)
 * Applied as --font-sans CSS variable
 */
export const fontSans = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-sans",
    display: "swap",
});

/**
 * Monospace font (Geist Mono)
 * Applied as --font-geist-mono CSS variable
 */
export const fontMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
    display: "swap",
});

/**
 * Helper to combine font variables for body className
 * Usage: <body className={getFontVariables()}>
 */
export function getFontVariables(): string {
    return `${fontSans.variable} ${fontMono.variable}`;
}
