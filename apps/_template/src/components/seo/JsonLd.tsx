import { siteConfig } from '@/config/site';

/**
 * Componente base para inyectar JSON-LD en el head.
 */
function JsonLdScript({ schema }: { schema: any }) {
    if (!schema) return null;
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface SchemaProps {
    tenantId: string;
    design: any;
    url: string;
}

/**
 * Genera el Schema de Organización/Negocio Local de forma dinámica.
 */
export function OrganizationSchema({ tenantId, design, url }: SchemaProps) {
    const businessName = design?.name || siteConfig.name;
    const description = design?.brandSettings?.tagline || design?.tagline || siteConfig.description;
    const logo = design?.brandSettings?.logoUrl || design?.logo || `${url}/favicon.ico`;
    
    // Determinar el tipo de negocio basado en features
    const features = (design?.features || []).map((f: any) => typeof f === 'string' ? f : f.type);
    const isRestaurant = features.includes('RESTAURANT') || features.includes('HAS_DIGITAL_MENU');
    
    const schema: any = {
        '@context': 'https://schema.org',
        '@type': isRestaurant ? 'Restaurant' : 'ProfessionalService',
        name: businessName,
        description: description,
        url: url,
        logo: logo,
        image: design?.brandSettings?.ogImage || logo,
        telephone: design?.contactPhone || siteConfig.phone,
        email: design?.contactEmail || siteConfig.email,
        priceRange: '$$',
    };

    if (design?.address) {
        schema.address = {
            '@type': 'PostalAddress',
            streetAddress: design.address,
            addressLocality: design.city || 'Colombia',
            addressCountry: 'CO',
        };
    }

    if (isRestaurant && design?.menuUrl) {
        schema.hasMenu = design.menuUrl;
    }

    return <JsonLdScript schema={schema} />;
}

/**
 * Genera el Schema del Sitio Web.
 */
export function WebSiteSchema({ tenantId, design, url }: SchemaProps) {
    const businessName = design?.name || siteConfig.name;
    
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: businessName,
        url: url,
        inLanguage: 'es',
        publisher: {
            '@type': 'Organization',
            name: businessName,
        },
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${url}/?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };

    return <JsonLdScript schema={schema} />;
}

/**
 * Componente que agrupa los esquemas globales para el Layout.
 */
export function GlobalSchemas({ tenantId, design, url }: SchemaProps) {
    return (
        <>
            <OrganizationSchema tenantId={tenantId} design={design} url={url} />
            <WebSiteSchema tenantId={tenantId} design={design} url={url} />
        </>
    );
}

// --- SCHEMAS ESPECÍFICOS PARA PÁGINAS ---

/**
 * Schema para productos individuales (Store).
 */
export function ProductSchema({ product, url, businessName }: { product: any, url: string, businessName: string }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images?.[0] || '',
        brand: {
            '@type': 'Brand',
            name: businessName
        },
        offers: {
            '@type': 'Offer',
            price: product.basePrice,
            priceCurrency: 'COP',
            availability: product.isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `${url}/tienda/${product.slug}`,
        }
    };

    return <JsonLdScript schema={schema} />;
}

/**
 * Schema para artículos de Blog.
 */
export function BlogPostingSchema({ post, url, businessName, logo }: { post: any, url: string, businessName: string, logo?: string }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: post.coverImage,
        datePublished: post.createdAt,
        dateModified: post.updatedAt || post.createdAt,
        author: {
            '@type': 'Organization',
            name: businessName
        },
        publisher: {
            '@type': 'Organization',
            name: businessName,
            logo: {
                '@type': 'ImageObject',
                url: logo
            }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${url}/blog/${post.slug}`
        }
    };

    return <JsonLdScript schema={schema} />;
}

/**
 * Schema para Breadcrumbs.
 */
export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return <JsonLdScript schema={schema} />;
}
