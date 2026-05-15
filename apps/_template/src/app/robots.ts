import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getDynamicUrl } from '@/lib/network';

export default async function robots(): Promise<MetadataRoute.Robots> {
    const headersList = await headers();
    const urlBase = getDynamicUrl(headersList);

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/dashboard/',
                    '/perfil/',
                    '/api/',
                    '/login',
                    '/registro',
                    '/forgot-password',
                    '/reset-password',
                    '/verificar-email',
                    '/_next/',
                ],
            },
        ],
        sitemap: `${urlBase}/sitemap.xml`,
    };
}

