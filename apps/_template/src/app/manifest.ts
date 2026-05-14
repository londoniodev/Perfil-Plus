import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { getTenantId } from '@/lib/config-server';
import { getTenantDesign } from '@/lib/tenant-server';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const tenantId = await getTenantId();
    const design = await getTenantDesign(tenantId);
    
    // Prioridad: Diseño del tenant > siteConfig (fallback)
    const name = design?.name || siteConfig.name;
    const description = design?.brandSettings?.metaDescription || design?.tagline || siteConfig.description;
    const themeColor = design?.brandSettings?.primaryColor || "#09090b";
    
    // Resolver icono dinámico
    // Prioridad: Favicon del tenant > Logo del tenant > Icono por defecto
    const iconUrl = design?.brandSettings?.faviconUrl || design?.brandSettings?.logoUrl || design?.logo || '/images/branding/icon.png';

    return {
        name: name,
        short_name: name.slice(0, 12),
        description: description,
        start_url: '/',
        display: 'standalone',
        background_color: '#09090b',
        theme_color: themeColor,
        icons: [
            {
                src: iconUrl,
                sizes: 'any',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: iconUrl,
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: iconUrl,
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
