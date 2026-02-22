import { MetadataRoute } from 'next';
import { API_BASE } from '@/lib/config';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

interface Post {
    slug: string;
    updatedAt?: string;
    createdAt: string;
}

interface Ebook {
    slug: string;
}

interface Theme {
    slug: string;
    courses?: { slug: string }[];
}

async function getPosts(): Promise<Post[]> {
    try {
        const res = await fetch(`${API_BASE}/posts?limit=100`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.data || [];
    } catch {
        return [];
    }
}

async function getEbooks(): Promise<Ebook[]> {
    try {
        const res = await fetch(`${API_BASE}/ebooks`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

async function getThemes(): Promise<Theme[]> {
    try {
        const res = await fetch(`${API_BASE}/themes`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Páginas estáticas
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${SITE_URL}/servicios`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/ebooks`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${SITE_URL}/formacion`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${SITE_URL}/empresas`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${SITE_URL}/politica-de-privacidad`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];

    // Posts del blog
    const posts = await getPosts();
    const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt || post.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // Ebooks
    const ebooks = await getEbooks();
    const ebookPages: MetadataRoute.Sitemap = ebooks.map((ebook) => ({
        url: `${SITE_URL}/ebooks/${ebook.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    // Temas y cursos
    const themes = await getThemes();
    const coursePages: MetadataRoute.Sitemap = [];

    themes.forEach((theme) => {
        coursePages.push({
            url: `${SITE_URL}/formacion/${theme.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        });

        theme.courses?.forEach((course) => {
            coursePages.push({
                url: `${SITE_URL}/formacion/${theme.slug}/${course.slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.5,
            });
        });
    });

    return [...staticPages, ...postPages, ...ebookPages, ...coursePages];
}

