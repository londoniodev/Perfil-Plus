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
};

export default config;
