import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/api';

export const runtime = 'edge';

export const alt = 'Artículo - Mauro Mera';
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

    // Fetch post data
    let postTitle = 'Artículo de Blog';
    let publishedDate = '';

    try {
        const post = await getPostBySlug(slug);
        postTitle = post.title;

        // Format date
        if (post.publishedAt) {
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
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    padding: '60px',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Badge */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '40px',
                    }}
                >
                    <div
                        style={{
                            background: '#8b5cf6',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontSize: 24,
                            fontWeight: 600,
                            display: 'flex',
                        }}
                    >
                        Blog
                    </div>
                </div>

                {/* Post Title */}
                <div
                    style={{
                        display: 'flex',
                        fontSize: 64,
                        fontWeight: 700,
                        color: '#1e293b',
                        lineHeight: 1.2,
                        marginBottom: 'auto',
                        maxWidth: '90%',
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
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                fontSize: 32,
                                fontWeight: 600,
                                color: '#1e293b',
                            }}
                        >
                            Mauro Mera
                        </div>
                        {publishedDate && (
                            <div
                                style={{
                                    display: 'flex',
                                    fontSize: 24,
                                    color: '#64748b',
                                }}
                            >
                                {publishedDate}
                            </div>
                        )}
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            fontSize: 24,
                            color: '#64748b',
                        }}
                    >
                        {new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mauromera.com').hostname}
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
