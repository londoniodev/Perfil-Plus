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

    // Ensure primary is a valid theme key, fallback to zinc ONLY if it's not a valid HSL string (basic check)
    // We treat any string containing spaces (e.g. "262 80% 50%") as a custom HSL value
    const isCustomColor = config.primary && !themes[config.primary as ThemeName] && config.primary.includes(" ");
    const primaryThemeKey = (config.primary && config.primary in themes)
        ? config.primary as ThemeName
        : "zinc"

    React.useEffect(() => {
        const root = document.documentElement

        let theme = themes[primaryThemeKey]

        // If Custom Color, override the base theme (zinc)
        if (isCustomColor && config.primary) {
            const base = themes.zinc
            const custom = config.primary
            const sidebarColors = getSidebarColors(custom)

            theme = {
                light: {
                    ...base.light,
                    "--primary": custom,
                    "--ring": custom,
                    ...(sidebarColors ? sidebarColors.light : {})
                } as any,
                dark: {
                    ...base.dark,
                    "--primary": custom,
                    "--ring": custom,
                    ...(sidebarColors ? sidebarColors.dark : {})
                } as any
            }
        }

        // 1. Inject Radius
        root.style.setProperty("--radius", `${config.radius}rem`)

        // 2. Inject Density (Currently just mapping spacial variables if needed, 
        // effectively handled by component 'size' props in consumption)
        // Future: could adjust --sidebar-width etc.

        // 3. Inject Colors
        // We need to inject both light and dark variants. 
        // Shadcn uses CSS variables like --primary: 222.2 47.4% 11.2%; 
        // The .dark class overrides these values.

        // Strategy: We inject a <style> tag or modify style properties directly.
        // Modifying style properties on :root handles the "default" (light) mode.
        // For dark mode, we can't easily set variables solely for .dark selector via inline styles on root.
        // SOLUTION: We construct a style block.

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

        // Cleanup function (optional, but good practice if provider unmounts)
        return () => {
            // We might persist it or remove it. Better to leave it to avoid FOUC on nav.
        }

    }, [config.primary, config.radius, primaryThemeKey, isCustomColor])

    return <>{children}</>
}
