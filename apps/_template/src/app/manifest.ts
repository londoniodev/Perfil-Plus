import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: siteConfig.name,
        short_name: siteConfig.name.slice(0, 12), // Keep it short
        description: siteConfig.description,
        start_url: '/',
        display: 'standalone',
        background_color: '#09090b', // zinc-950 (dark theme common)
        theme_color: '#09090b',
        icons: [
            {
                src: '/images/branding/icon.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
