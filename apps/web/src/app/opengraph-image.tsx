import { ImageResponse } from 'next/og';
import { siteConfig } from '@/config/site';

export const runtime = 'edge';

export const alt = `${siteConfig.name} - Open Graph Image`;
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Logo/Brand Name */}
                <div
                    style={{
                        display: 'flex',
                        fontSize: 80,
                        fontWeight: 700,
                        color: 'white',
                        marginBottom: 20,
                        textAlign: 'center',
                    }}
                >
                    {siteConfig.name}
                </div>

                {/* Tagline */}
                <div
                    style={{
                        display: 'flex',
                        fontSize: 32,
                        color: 'rgba(255,255,255,0.9)',
                        fontWeight: 400,
                        textAlign: 'center',
                        padding: '0 40px',
                    }}
                >
                    {siteConfig.description}
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
