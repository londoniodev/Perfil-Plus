/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
        './src/context/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Map to CSS variables from variables.css
                background: 'var(--background)',
                'background-secondary': 'var(--background-secondary)',
                foreground: 'var(--foreground)',
                'foreground-muted': 'var(--foreground-muted)',
                primary: {
                    DEFAULT: 'var(--primary)',
                    light: 'var(--primary-light)',
                    dark: 'var(--primary-dark)',
                },
                secondary: 'var(--secondary)',
                accent: {
                    DEFAULT: 'var(--accent)',
                    light: 'var(--accent-light)',
                    glow: 'var(--accent-glow)',
                },
                success: {
                    DEFAULT: 'var(--success)',
                    bg: 'var(--success-bg)',
                },
                error: {
                    DEFAULT: 'var(--error)',
                    bg: 'var(--error-bg)',
                    border: 'var(--error-border)',
                },
                warning: {
                    DEFAULT: 'var(--warning)',
                    bg: 'var(--warning-bg)',
                },
                info: {
                    DEFAULT: 'var(--info)',
                    bg: 'var(--info-bg)',
                },
                purple: {
                    DEFAULT: 'var(--purple)',
                    bg: 'var(--purple-bg)',
                },
                border: 'var(--border)',
                'border-light': 'var(--border-light)',
                'card-bg': 'var(--card-bg)',
                'card-bg-hover': 'var(--card-bg-hover)',
            },
            fontFamily: {
                sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-geist-mono)', 'monospace'],
            },
            borderRadius: {
                xl: '0.75rem',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
