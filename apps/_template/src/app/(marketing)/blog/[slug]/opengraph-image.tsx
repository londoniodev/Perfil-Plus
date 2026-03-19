import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/api';
import { getTenantId } from '@/lib/config-server';
import { headers } from 'next/headers';

export const runtime = 'edge';

export const alt = 'Imagen de Artículo';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
    const { slug } = await params;
    
    const tenantId = await getTenantId();
    const headersList = await headers();
    const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost";

    // Intentamos cargar el diseño del Tenant
    let tenantName = 'Blog';
    let primaryColor = '#8b5cf6';
    let logoUrl = '';

    try {
        const _apiUrl = (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://api:3001/api').replace(/\/+$/, "");
        const API_URL = _apiUrl.endsWith('/api') ? _apiUrl : `${_apiUrl}/api`;
        const finalEndpoint = `${API_URL}/tenant/branding`;

        const response = await fetch(finalEndpoint, {
            cache: 'force-cache',
            headers: {
                'Content-Type': 'application/json',
                'x-tenant-id': tenantId,
                'x-internal-token': process.env.INTERNAL_API_KEY || 'default_dev_secret_key',
            }
        });

        if (response.ok) {
            const data = await response.json();
            tenantName = data?.name || tenantName;
            primaryColor = data?.design?.colors?.primary || primaryColor;
            logoUrl = data?.logo || '';
        }
    } catch (e) {
        console.warn('Error fetching branding for OG image:', e);
    }

    // Fetch post data
    let postTitle = 'Artículo de Blog';
    let publishedDate = '';

    try {
        const post = await getPostBySlug(tenantId, slug);
        postTitle = post?.title || postTitle;

        // Format date
        if (post?.publishedAt) {
            const date = new Date(post.publishedAt);
            publishedDate = new Intl.DateTimeFormat('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }).format(date);
        }
    } catch (error) {
        console.error('Error fetching post for OG image:', error);
    }

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)', // Fondo oscuro más premium
                    padding: '80px',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Badge / Logo */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '60px',
                    }}
                >
                    {logoUrl ? (
                         // eslint-disable-next-line @next/next/no-img-element
                        <img 
                            src={logoUrl} 
                            alt={tenantName} 
                            style={{ width: 48, height: 48, borderRadius: '8px', objectFit: 'cover' }} 
                        />
                    ) : (
                        <div
                            style={{
                                background: primaryColor,
                                color: 'white',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontSize: 24,
                                fontWeight: 700,
                            }}
                        >
                            {tenantName[0]}
                        </div>
                    )}
                    <span style={{ color: 'white', fontSize: 28, fontWeight: 600 }}>{tenantName}</span>
                </div>

                {/* Badge de Categoría */}
                <div style={{ display: 'flex', marginBottom: '30px' }}>
                    <div
                        style={{
                            background: `${primaryColor}20`, // Color con opacidad
                            border: `1px solid ${primaryColor}`,
                            color: primaryColor,
                            padding: '8px 20px',
                            borderRadius: '9999px',
                            fontSize: 20,
                            fontWeight: 600,
                        }}
                    >
                        Artículo de Blog
                    </div>
                </div>

                {/* Post Title */}
                <div
                    style={{
                        display: 'flex',
                        fontSize: 68,
                        fontWeight: 800,
                        color: 'white',
                        lineHeight: 1.1,
                        marginBottom: 'auto',
                        maxWidth: '95%',
                        letterSpacing: '-0.02em',
                    }}
                >
                    {postTitle}
                </div>

                {/* Footer */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        paddingTop: '30px',
                    }}
                >
                    <div style={{ display: 'flex', fontSize: 24, color: '#94a3b8' }}>
                         {publishedDate || 'Lectura recomendada'}
                    </div>
                    <div style={{ display: 'flex', fontSize: 24, color: primaryColor, fontWeight: 600 }}>
                        {host}
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
