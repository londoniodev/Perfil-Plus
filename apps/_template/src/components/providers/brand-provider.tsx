"use client";

import { useEffect } from "react";
import { brandConfig } from "@/config/brand";
import { useTheme } from "next-themes";

export function BrandProvider({ children }: { children: React.ReactNode }) {
    const { setTheme } = useTheme();

    useEffect(() => {
        // 1. Inject CSS Variables
        const root = document.documentElement;

        // Primary Color
        root.style.setProperty("--primary", brandConfig.colors.primary);
        // Also update ring/border/accent if we want a full monocolor theme, 
        // but typically primary is enough for the "Brand Color". 
        // Shadcn uses --ring based on primary usually.
        root.style.setProperty("--ring", brandConfig.colors.primary);

        // Radius
        root.style.setProperty("--radius", `${brandConfig.radius}rem`);

        // Fonts
        root.style.setProperty("--font-heading", brandConfig.fonts.heading);
        root.style.setProperty("--font-body", brandConfig.fonts.body);

        // 2. Load Google Fonts
        const fontsToLoad = [brandConfig.fonts.heading, brandConfig.fonts.body];
        const uniqueFonts = [...new Set(fontsToLoad)];

        // Construct Google Fonts URL
        // Example: https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@400;700&display=swap
        if (uniqueFonts.length > 0) {
            const linkId = 'brand-google-fonts';
            let link = document.getElementById(linkId) as HTMLLinkElement;

            if (!link) {
                link = document.createElement('link');
                link.id = linkId;
                link.rel = 'stylesheet';
                document.head.appendChild(link);
            }

            const fontParams = uniqueFonts.map(font => `family=${font.replace(/\s+/g, '+')}:wght@300;400;500;600;700`).join('&');
            link.href = `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;
        }

        // 3. Set Theme directly if forced
        if (brandConfig.theme !== 'system') {
            setTheme(brandConfig.theme);
        }

    }, [setTheme]);

    return <>{children}</>;
}
