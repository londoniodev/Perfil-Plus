"use client"

import * as React from "react"
import { 
    generateBrandingCSS, 
    BrandSettings
} from "../lib/branding"

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

    // Use isomorphic effect for safe DOM mutation
    const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

    // Si primary === "custom", las variables CSS ya fueron inyectadas vía SSR
    // en el <body> del Root Layout o vía <style> en el <head>.
    const isServerInjected = config.primary === "custom";

    useIsomorphicLayoutEffect(() => {
        if (isServerInjected) return;

        const combinedCssContent = generateBrandingCSS(config);

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

    }, [config, isServerInjected]);

    // Apply specific color theme (Light / Dark / System)
    const { setTheme } = require("next-themes").useTheme();

    React.useEffect(() => {
        if (config.mode && ["light", "dark", "system"].includes(config.mode)) {
            setTheme(config.mode);
        }
    }, [config.mode, setTheme]);

    return <>{children}</>;
}
