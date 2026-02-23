"use client"

import * as React from "react"
import { themes, ThemeName } from "../lib/themes"

interface BrandSettings {
    primary?: string
    radius?: number
    density?: "default" | "compact" | "spacious"
    mode?: "light" | "dark" | "system"
}

interface BrandProviderProps {
    children?: React.ReactNode
    settings?: BrandSettings | null
    defaultSettings?: BrandSettings
}

function getSidebarColors(hsl: string) {
    const parts = hsl.split(' ');
    if (parts.length < 3) return null;
    const h = parts[0];
    const s = parts[1];

    // Light Mode: Very light background (96%), dark text
    // Dark Mode: Dark background (15%), light text

    return {
        light: {
            "--sidebar-accent": `${h} ${s} 96%`,
            "--sidebar-accent-foreground": `${h} ${s} 40%`,
            "--sidebar-ring": hsl,
            "--sidebar-primary": hsl,
            "--sidebar-primary-foreground": "0 0% 98%",
        },
        dark: {
            "--sidebar-accent": `${h} ${s} 15%`,
            "--sidebar-accent-foreground": `${h} ${s} 90%`,
            "--sidebar-ring": hsl,
            "--sidebar-primary": hsl,
            "--sidebar-primary-foreground": "0 0% 98%",
        }
    }
}

export function BrandProvider({
    children,
    settings,
    defaultSettings = {
        primary: "zinc",
        radius: 0.5,
        density: "default"
    }
}: BrandProviderProps) {
    // Merge settings with defaults
    const config = { ...defaultSettings, ...settings }

    // Función segura para convertir Hex a HSL en tiempo real 
    const hexToHSL = (hex: string): string => {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt("0x" + hex[1] + hex[1]);
            g = parseInt("0x" + hex[2] + hex[2]);
            b = parseInt("0x" + hex[3] + hex[3]);
        } else if (hex.length === 7) {
            r = parseInt("0x" + hex[1] + hex[2]);
            g = parseInt("0x" + hex[3] + hex[4]);
            b = parseInt("0x" + hex[5] + hex[6]);
        }
        r /= 255; g /= 255; b /= 255;
        const cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin;
        let h = 0, s = 0, l = 0;

        if (delta === 0) h = 0;
        else if (cmax === r) h = ((g - b) / delta) % 6;
        else if (cmax === g) h = (b - r) / delta + 2;
        else h = (r - g) / delta + 4;

        h = Math.round(h * 60);
        if (h < 0) h += 360;

        l = (cmax + cmin) / 2;
        s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);

        return `${h} ${s}% ${l}%`;
    };

    // Evaluate custom color. Check if it's hex or has spaces (hsl).
    const isCustomColor = config.primary && !themes[config.primary as ThemeName] && (config.primary.includes(" ") || config.primary.startsWith("#"));
    let finalCustomColor = config.primary;

    // Si entró gurdado como Hexadecimal thel frontend, lo pasamos a HSL nativo the Shadcn
    if (isCustomColor && config.primary && config.primary.startsWith("#")) {
        finalCustomColor = hexToHSL(config.primary);
    }

    const primaryThemeKey = (config.primary && config.primary in themes)
        ? config.primary as ThemeName
        : "zinc"

    React.useEffect(() => {
        const root = document.documentElement

        let theme = themes[primaryThemeKey]

        // If Custom Color, override the base theme (zinc)
        if (isCustomColor && finalCustomColor) {
            const base = themes.zinc
            const custom = finalCustomColor
            const sidebarColors = getSidebarColors(custom)

            theme = {
                light: {
                    ...base.light,
                    "--primary": custom,
                    "--primary-foreground": "0 0% 100%",
                    "--ring": custom,
                    ...(sidebarColors ? sidebarColors.light : {})
                } as any,
                dark: {
                    ...base.dark,
                    "--primary": custom,
                    "--primary-foreground": "0 0% 100%",
                    "--ring": custom,
                    ...(sidebarColors ? sidebarColors.dark : {})
                } as any
            }
        }

        // 1. Inject Radius
        root.style.setProperty("--radius", `${config.radius}rem`)

        const cssContent = `
            :root {
                ${Object.entries(theme.light).map(([key, value]) => `${key}: ${value};`).join(' ')}
                --radius: ${config.radius}rem;
            }
            .dark {
                ${Object.entries(theme.dark).map(([key, value]) => `${key}: ${value};`).join(' ')}
            }
        `

        const styleId = "dynamic-branding-styles"
        let styleEl = document.getElementById(styleId) as HTMLStyleElement

        if (!styleEl) {
            styleEl = document.createElement("style")
            styleEl.id = styleId
            document.head.appendChild(styleEl)
        }

        styleEl.textContent = cssContent

    }, [config.primary, config.radius, primaryThemeKey, isCustomColor]);

    // Apply specific color theme (Light / Dark / System)
    const { setTheme } = require("next-themes").useTheme();
    React.useEffect(() => {
        if (config.mode && ["light", "dark", "system"].includes(config.mode)) {
            setTheme(config.mode);
        }
    }, [config.mode, setTheme]);

    return <>{children}</>
}
