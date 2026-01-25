import { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: siteConfig.name,
        short_name: siteConfig.name,
        description: siteConfig.description,
        start_url: '/',
        display: 'standalone',
        background_color: '#0f172a', // Azul oscuro (Slate 900)
        theme_color: '#0f172a',
        icons: [
            {
                src: '/images/branding/icon.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}

