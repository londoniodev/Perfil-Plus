import { ImageResponse } from 'next/og';
import { getCourseBySlug } from '@/lib/api';

export const runtime = 'edge';

export const alt = 'Curso Online - Mauro Mera';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

interface Props {
    params: Promise<{ slug: string; courseSlug: string }>;
}

export default async function Image({ params }: Props) {
    const { courseSlug } = await params;

    // Fetch course data
    let courseTitle = 'Curso Online';
    try {
        const course = await getCourseBySlug(courseSlug);
        courseTitle = course.title;
    } catch (error) {
        console.error('Error fetching course for OG image:', error);
    }

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
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
                            background: '#6366f1',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontSize: 24,
                            fontWeight: 600,
                            display: 'flex',
                        }}
                    >
                        Curso Online
                    </div>
                </div>

                {/* Course Title */}
                <div
                    style={{
                        display: 'flex',
                        fontSize: 64,
                        fontWeight: 700,
                        color: 'white',
                        lineHeight: 1.2,
                        marginBottom: 'auto',
                        maxWidth: '90%',
                    }}
                >
                    {courseTitle}
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
                            fontSize: 32,
                            fontWeight: 600,
                            color: 'white',
                        }}
                    >
                        Mauro Mera
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            fontSize: 24,
                            color: 'rgba(255,255,255,0.7)',
                        }}
                    >
                        {new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').hostname}
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
