import { MetadataRoute } from 'next';
import { API_BASE } from '@/lib/config';
import { getTenantId } from '@/lib/config-server';
import { headers } from 'next/headers';

interface Post {
    slug: string;
    updatedAt?: string;
    createdAt: string;
}

interface Product {
    slug: string;
    updatedAt?: string;
    createdAt: string;
}

interface Theme {
    slug: string;
    courses?: { slug: string }[];
}

async function getPosts(tenantId: string): Promise<Post[]> {
    try {
        const res = await fetch(`${API_BASE}/posts?limit=100`, {
            headers: { 'x-tenant-id': tenantId },
            next: { revalidate: 3600 },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.data || [];
    } catch {
        return [];
    }
}

async function getProducts(tenantId: string): Promise<Product[]> {
    try {
        const res = await fetch(`${API_BASE}/store/products?allVariants=true`, {
            headers: { 'x-tenant-id': tenantId },
            next: { revalidate: 3600 },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : (data.data || []);
    } catch {
        return [];
    }
}

async function getThemes(tenantId: string): Promise<Theme[]> {
    try {
        const res = await fetch(`${API_BASE}/themes`, {
            headers: { 'x-tenant-id': tenantId },
            next: { revalidate: 3600 },
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const tenantId = await getTenantId();
    const headersList = await headers();
    
    // 1. Calcular el dominio actual (dinámico por Tenant)
    const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost";
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.includes(":");
    const protocol = isLocal ? "http" : "https";
    const urlBase = `${protocol}://${host}`;

    // 2. Leer Features
    const featuresHeader = headersList.get("x-tenant-features") || "[]";
    let features: string[] = [];
    try { features = JSON.parse(featuresHeader); } catch { }
    const upperFeatures = features.map(f => f.toUpperCase());

    // 3. Páginas estáticas base (siempre cargan)
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: urlBase,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${urlBase}/politica-de-privacidad`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];

    // 4. Cargar páginas según Features
    let postPages: MetadataRoute.Sitemap = [];
    let productPages: MetadataRoute.Sitemap = [];
    let coursePages: MetadataRoute.Sitemap = [];

    // --- BLOG ---
    const hasBlog = upperFeatures.includes("BLOG");
    if (hasBlog) {
        staticPages.push({
            url: `${urlBase}/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        });

        const posts = await getPosts(tenantId);
        postPages = posts.map((post) => ({
            url: `${urlBase}/blog/${post.slug}`,
            lastModified: new Date(post.updatedAt || post.createdAt),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    }

    // --- ECOMMERCE / STORE ---
    const hasEcommerce = upperFeatures.includes("ECOMMERCE") || upperFeatures.includes("STORE") || upperFeatures.includes("RESTAURANT");
    if (hasEcommerce) {
        staticPages.push({
            url: `${urlBase}/tienda`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        });

        const products = await getProducts(tenantId);
        productPages = products.map((product) => ({
            url: `${urlBase}/tienda/${product.slug}`,
            lastModified: new Date(product.updatedAt || product.createdAt),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));
    }

    // --- FORMACIÓN / CURSOS ---
    const hasLms = upperFeatures.includes("LMS");
    if (hasLms) {
        staticPages.push({
            url: `${urlBase}/formacion`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        });

        const themes = await getThemes(tenantId);
        themes.forEach((theme) => {
            coursePages.push({
                url: `${urlBase}/cursos/${theme.slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            });

            theme.courses?.forEach((course) => {
                coursePages.push({
                    url: `${urlBase}/cursos/${theme.slug}/${course.slug}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly' as const,
                    priority: 0.5,
                });
            });
        });
    }

    // --- SERVICIOS / PORTAFOLIO ---
    const isMasterTenant = host.includes("xn--alvarolondoo-khb") || tenantId === "alvarolondono";
    if (isMasterTenant || upperFeatures.includes("PORTFOLIO")) {
        staticPages.push(
            {
                url: `${urlBase}/servicios`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.9,
            },
            {
                url: `${urlBase}/portafolio`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.7,
            }
        );
    }

    return [...staticPages, ...postPages, ...productPages, ...coursePages];
}

