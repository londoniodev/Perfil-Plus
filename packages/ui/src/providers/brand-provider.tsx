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

    // Ensure primary is a valid theme key, fallback to zinc
    const primaryTheme = (config.primary && config.primary in themes)
        ? config.primary as ThemeName
        : "zinc"

    React.useEffect(() => {
        const root = document.documentElement
        const theme = themes[primaryTheme]

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

    }, [config.primary, config.radius, primaryTheme])

    return <>{children}</>
}
