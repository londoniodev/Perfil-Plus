import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Mauro Mera - Psicología, Mentoría y Liderazgo';
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
                    }}
                >
                    Mauro Mera
                </div>

                {/* Tagline */}
                <div
                    style={{
                        display: 'flex',
                        fontSize: 36,
                        color: 'rgba(255,255,255,0.9)',
                        fontWeight: 400,
                    }}
                >
                    Psicología • Mentoría • Liderazgo
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
