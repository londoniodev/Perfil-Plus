export interface BrandConfig {
    colors: {
        primary: string; // HSL value, e.g., "222.2 47.4% 11.2%"
    };
    fonts: {
        heading: string; // Google Font name
        body: string; // Google Font name
    };
    radius: number; // rem value
    theme: 'light' | 'dark' | 'system';
}

export const brandConfig: BrandConfig = {
    colors: {
        primary: "255 90% 60%", // Example vibrant purple default
    },
    fonts: {
        heading: "Inter",
        body: "Inter",
    },
    radius: 0.5,
    theme: 'system',
};
