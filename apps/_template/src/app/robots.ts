import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function robots(): Promise<MetadataRoute.Robots> {
    const headersList = await headers();
    const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost";
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.includes(":");
    const protocol = isLocal ? "http" : "https";
    const urlBase = `${protocol}://${host}`;

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
                    '/verificar-email',
                    '/_next/',
                ],
            },
        ],
        sitemap: `${urlBase}/sitemap.xml`,
    };
}

