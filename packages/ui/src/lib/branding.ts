import { themes, ThemeName } from "./themes"

export interface BrandSettings {
    primary?: string
    radius?: number
    density?: "default" | "compact" | "spacious"
    mode?: "light" | "dark" | "system"
}

export function hexToHSL(hex: string): string {
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
}

export function getBrandVariants(hsl: string, isDark: boolean) {
    const parts = hsl.split(' ');
    if (parts.length < 3) return null;
    const h = parts[0];
    const s = parts[1];
    const lValue = parseFloat(parts[2].replace('%', ''));

    const softLightness = isDark ? "15%" : "95%";
    const useDarkForeground = lValue > 60;
    const foreground = useDarkForeground 
        ? `${h} ${s} 12%` 
        : "0 0% 100%";    

    return {
        "--primary-soft": `${h} ${s} ${softLightness}`,
        "--primary-foreground": foreground,
        "--primary-muted-foreground": `${h} ${parseFloat(s) / 2}% ${isDark ? "70%" : "35%"}`,
    };
}

export function getSidebarColors(hsl: string) {
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

export function generateBrandingCSS(settings: BrandSettings | null): string {
    const config = {
        primary: "zinc",
        radius: 0.5,
        ...settings
    };

    const isCustomColor = config.primary && !themes[config.primary as ThemeName] && (config.primary.includes(" ") || config.primary.startsWith("#"));
    let finalCustomColor = config.primary;

    if (isCustomColor && config.primary && config.primary.startsWith("#")) {
        finalCustomColor = hexToHSL(config.primary);
    }

    const primaryThemeKey = (config.primary && config.primary in themes)
        ? config.primary as ThemeName
        : "zinc";

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

    const cssContent = `
        :root {
            --radius: ${config.radius}rem;
            ${Object.entries(theme.light).map(([key, value]) => `${key}: ${value};`).join(' ')}
        }
        .dark {
            ${Object.entries(theme.dark).map(([key, value]) => `${key}: ${value};`).join(' ')}
        }
    `;

    return cssContent;
}
