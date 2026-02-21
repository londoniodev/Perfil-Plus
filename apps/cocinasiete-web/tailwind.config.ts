import type { Config } from "tailwindcss";
import { sharedConfig } from "@alvarosky/tailwind-config";

const config: Config = {
    presets: [sharedConfig],
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
        "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "cs-primary": "#00c48c",
                "cs-secondary": "#fbb040",
                "cs-bg-light": "#ffffff",
                "cs-bg-dark": "#1a1a1a",
                "cs-surface-light": "#f8f9fa",
                "cs-surface-dark": "#2d2d2d",
            },
            fontFamily: {
                display: ["Poppins", "sans-serif"],
            },
            borderRadius: {
                "cs-xl": "20px",
            },
        },
    },
};

export default config;
