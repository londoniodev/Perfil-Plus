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

function getBrandVariants(hsl: string, isDark: boolean) {
    const parts = hsl.split(' ');
    if (parts.length < 3) return null;
    const h = parts[0];
    const s = parts[1];
    const lValue = parseFloat(parts[2].replace('%', ''));

    // Soft version (10-15% of the color)
    const softLightness = isDark ? "15%" : "95%";
    
    // Foreground contrast: If color is too light, use a very dark shade of it.
    // Threshold usually around 60% lightness.
    const useDarkForeground = lValue > 60;
    const foreground = useDarkForeground 
        ? `${h} ${s} 12%` // Dark shade
        : "0 0% 100%";    // White

    return {
        "--primary-soft": `${h} ${s} ${softLightness}`,
        "--primary-foreground": foreground,
        "--primary-muted-foreground": `${h} ${parseFloat(s) / 2}% ${isDark ? "70%" : "35%"}`,
    };
}

function getSidebarColors(hsl: string) {
    const parts = hsl.split(' ');
    if (parts.length < 3) return null;
    const h = parts[0];
    const s = parts[1];

    return {
        light: {
            "--sidebar-accent": `${h} ${s} 96%`,
            "--sidebar-accent-foreground": `${h} ${s} 30%`,
            "--sidebar-ring": hsl,
            "--sidebar-primary": hsl,
            "--sidebar-primary-foreground": "0 0% 98%",
        },
        dark: {
            "--sidebar-accent": `${h} ${s} 12%`,
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

    // Determine theme payload
    let theme = { ...themes[primaryThemeKey] };
    const custom = isCustomColor && finalCustomColor ? finalCustomColor : (theme.light as any)["--primary"];

    if (custom) {
        const sidebarColors = getSidebarColors(custom);
        const variantsLight = getBrandVariants(custom, false);
        const variantsDark = getBrandVariants(custom, true);

        theme = {
            light: {
                ...theme.light,
                "--primary": custom,
                "--ring": custom,
                ...variantsLight,
                ...(sidebarColors ? sidebarColors.light : {})
            } as any,
            dark: {
                ...theme.dark,
                "--primary": custom,
                "--ring": custom,
                ...variantsDark,
                ...(sidebarColors ? sidebarColors.dark : {})
            } as any
        };
    }

    // Use isomorphic effect for safe DOM mutation
    const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

    // Si primary === "custom", las variables CSS ya fueron inyectadas vía SSR
    // en el <body> del Root Layout. NO debemos sobreescribirlas.
    const isServerInjected = config.primary === "custom";

    useIsomorphicLayoutEffect(() => {
        const root = document.documentElement;

        // 1. Inject Radius directly to :root (always applies)
        root.style.setProperty("--radius", `${config.radius}rem`);

        // 2. Si es "custom" (inyectado vía SSR), NO sobreescribir las variables de color.
        if (isServerInjected) return;

        // 3. Inject Light & Dark Variables via <style> to preserve CSS specificity rules
        // Inline styles (root.style.setProperty) have higher specificity than .dark class, 
        // breaking dark mode. So we MUST inject them as CSS rules.
        const combinedCssContent = `
            :root {
                ${Object.entries(theme.light).map(([key, value]) => `${key}: ${value};`).join(' ')}
            }
            .dark {
                ${Object.entries(theme.dark).map(([key, value]) => `${key}: ${value};`).join(' ')}
            }
        `;

        const styleId = "dynamic-branding-styles";
        let styleEl = document.getElementById(styleId) as HTMLStyleElement;

        if (!styleEl) {
            styleEl = document.createElement("style");
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
        }

        if (styleEl.textContent !== combinedCssContent) {
            styleEl.textContent = combinedCssContent;
        }

        // Clean up old dark-only style tag if it existed from previous version
        const oldDarkStyleEl = document.getElementById("dynamic-branding-dark-styles");
        if (oldDarkStyleEl) oldDarkStyleEl.remove();

    }, [theme, config.radius, isServerInjected]);

    // Apply specific color theme (Light / Dark / System)
    const { setTheme } = require("next-themes").useTheme();

    React.useEffect(() => {
        if (config.mode && ["light", "dark", "system"].includes(config.mode)) {
            setTheme(config.mode);
        }
    }, [config.mode, setTheme]);

    return <>{children}</>;
}
