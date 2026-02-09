import type { Config } from "tailwindcss";
import { sharedConfig } from "@alvarosky/tailwind-config";

const config: Config = {
    presets: [sharedConfig],
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-body)"],
                heading: ["var(--font-heading)"],
            },
            transitionDuration: {
                "2000": "2000ms",
            },
        },
    },
};

export default config;
