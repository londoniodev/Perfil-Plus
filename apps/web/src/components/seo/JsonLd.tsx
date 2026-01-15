const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mauromera.com';

// ============================================================================
// SCHEMAS GLOBALES
// ============================================================================

// Schema para Mauro Mera como persona pública
export function PersonSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Mauricio Mera',
        alternateName: 'Mauro Mera',
        description: 'Psicólogo, consultor organizacional y coach. Acompaño a personas, equipos y organizaciones a tomar decisiones conscientes.',
        url: SITE_URL,
        image: `${SITE_URL}/images/hero/mauro_hero.png`,
        jobTitle: ['Psicólogo', 'Consultor Organizacional', 'Coach'],
        knowsAbout: [
            'Psicología Organizacional',
            'Liderazgo',
            'Coaching',
            'Cultura Organizacional',
            'Psicoterapia',
            'Orientación Vocacional',
        ],
        sameAs: [
            'https://wa.me/573183771838',
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// Schema para la organización/marca
export function OrganizationSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        name: 'Mauro Mera',
        description: 'Consultoría organizacional, coaching y psicoterapia. Acompañamiento profesional para personas, equipos y organizaciones.',
        url: SITE_URL,
        logo: `${SITE_URL}/images/branding/menu_logo.png`,
        image: `${SITE_URL}/images/hero/mauro_hero.png`,
        telephone: '+573183771838',
        priceRange: '$$',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Calle 18a #55-105',
            addressLocality: 'Cañaverales',
            postalCode: '760063',
            addressCountry: 'CO',
        },
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+57-318-377-1838',
            contactType: 'customer service',
            availableLanguage: ['Spanish'],
        },
        areaServed: {
            '@type': 'Country',
            name: 'Colombia',
        },
        serviceType: [
            'Consultoría Organizacional',
            'Coaching Ejecutivo',
            'Psicoterapia',
            'Orientación Vocacional',
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// Schema para el sitio web
export function WebSiteSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Mauro Mera',
        description: 'Psicología, cultura y decisiones conscientes',
        url: SITE_URL,
        inLanguage: 'es',
        publisher: {
            '@type': 'Person',
            name: 'Mauricio Mera',
        },
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/blog?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// Schema combinado para incluir en el layout
export function GlobalSchemas() {
    return (
        <>
            <PersonSchema />
            <OrganizationSchema />
            <WebSiteSchema />
        </>
    );
}

// ============================================================================
// SCHEMAS DE NAVEGACIÓN
// ============================================================================

// Schema para breadcrumbs
interface BreadcrumbItem {
    name: string;
    url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
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

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ============================================================================
// SCHEMAS DE SERVICIOS
// ============================================================================

export interface ServiceSchemaProps {
    name: string;
    description: string;
    url: string;
    serviceType?: string;
    offers?: {
        price?: number;
        priceCurrency?: string;
        priceRange?: string;
    };
}

export function ServiceSchema({ name, description, url, serviceType, offers }: ServiceSchemaProps) {
    const schema: any = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name,
        description,
        url,
        serviceType: serviceType || name,
        provider: {
            '@type': 'Person',
            name: 'Mauricio Mera',
            url: SITE_URL,
        },
        areaServed: {
            '@type': 'Country',
            name: 'Colombia',
        },
    };

    if (offers) {
        schema.offers = {
            '@type': 'Offer',
            ...offers,
        };
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// Schema múltiple para página de servicios
export function ServicesPageSchema() {
    const services = [
        {
            '@type': 'Service',
            name: 'Consultoría Organizacional',
            description: 'Diagnóstico de cultura y clima organizacional, desarrollo de liderazgo, team coaching y gestión del cambio para empresas.',
            url: `${SITE_URL}/servicios#empresas`,
            serviceType: 'Business Consulting',
            provider: { '@type': 'Person', name: 'Mauricio Mera' },
        },
        {
            '@type': 'Service',
            name: 'Explora - Orientación Vocacional',
            description: 'Orientación vocacional y profesional con tecnología de IA. Test de perfil vocacional, análisis de resultados y roadmap de carreras.',
            url: `${SITE_URL}/servicios#explora`,
            serviceType: 'Career Counseling',
            provider: { '@type': 'Person', name: 'Mauricio Mera' },
        },
        {
            '@type': 'Service',
            name: 'Psicoterapia y Coaching',
            description: 'Psicoterapia para ansiedad, depresión, estrés. Coaching de propósito y desarrollo personal. Modalidad online y presencial.',
            url: `${SITE_URL}/servicios#psicoterapia`,
            serviceType: 'PsychologicalTreatment',
            provider: { '@type': 'Person', name: 'Mauricio Mera' },
        },
    ];

    const schema = {
        '@context': 'https://schema.org',
        '@graph': services,
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ============================================================================
// SCHEMAS PARA CURSOS Y EBOOKS
// ============================================================================

export interface CourseSchemaProps {
    name: string;
    description: string;
    url: string;
    provider?: string;
    image?: string;
    duration?: string;
    educationalLevel?: string;
    hasCourseInstance?: {
        startDate?: string;
        endDate?: string;
        courseMode?: 'online' | 'onsite' | 'blended';
    };
}

export function CourseSchema({
    name,
    description,
    url,
    provider = 'Mauricio Mera',
    image,
    duration,
    educationalLevel,
    hasCourseInstance
}: CourseSchemaProps) {
    const schema: any = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name,
        description,
        url,
        provider: {
            '@type': 'Person',
            name: provider,
            url: SITE_URL,
        },
        inLanguage: 'es',
    };

    if (image) schema.image = image;
    if (duration) schema.timeRequired = duration;
    if (educationalLevel) schema.educationalLevel = educationalLevel;

    if (hasCourseInstance) {
        schema.hasCourseInstance = {
            '@type': 'CourseInstance',
            courseMode: hasCourseInstance.courseMode || 'online',
            ...hasCourseInstance,
        };
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export interface ProductSchemaProps {
    name: string;
    description: string;
    url: string;
    image: string;
    price: number;
    priceCurrency?: string;
    author?: string;
    datePublished?: string;
}

export function ProductSchema({
    name,
    description,
    url,
    image,
    price,
    priceCurrency = 'COP',
    author = 'Mauricio Mera',
    datePublished
}: ProductSchemaProps) {
    const schema: any = {
        '@context': 'https://schema.org',
        '@type': 'Book',
        name,
        description,
        url,
        image,
        author: {
            '@type': 'Person',
            name: author,
        },
        publisher: {
            '@type': 'Person',
            name: 'Mauro Mera',
        },
        bookFormat: 'EBook',
        inLanguage: 'es',
        offers: {
            '@type': 'Offer',
            price,
            priceCurrency,
            availability: 'https://schema.org/InStock',
            url,
        },
    };

    if (datePublished) schema.datePublished = datePublished;

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ============================================================================
// SCHEMAS DE CONTENIDO
// ============================================================================

export interface FAQItem {
    question: string;
    answer: string;
}

export function FAQSchema({ items }: { items: FAQItem[] }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
            },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export interface VideoSchemaProps {
    name: string;
    description: string;
    thumbnailUrl: string;
    uploadDate: string;
    duration?: string;
    embedUrl?: string;
    contentUrl?: string;
}

export function VideoSchema({
    name,
    description,
    thumbnailUrl,
    uploadDate,
    duration,
    embedUrl,
    contentUrl
}: VideoSchemaProps) {
    const schema: any = {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name,
        description,
        thumbnailUrl,
        uploadDate,
        publisher: {
            '@type': 'Person',
            name: 'Mauricio Mera',
        },
    };

    if (duration) schema.duration = duration;
    if (embedUrl) schema.embedUrl = embedUrl;
    if (contentUrl) schema.contentUrl = contentUrl;

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// Schema para páginas de colección (blog, ebooks, cursos)
export interface CollectionPageSchemaProps {
    name: string;
    description: string;
    url: string;
    itemListElement?: { name: string; url: string }[];
}

export function CollectionPageSchema({
    name,
    description,
    url,
    itemListElement
}: CollectionPageSchemaProps) {
    const schema: any = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name,
        description,
        url,
        isPartOf: {
            '@type': 'WebSite',
            name: 'Mauro Mera',
            url: SITE_URL,
        },
    };

    if (itemListElement && itemListElement.length > 0) {
        schema.mainEntity = {
            '@type': 'ItemList',
            itemListElement: itemListElement.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                url: item.url,
            })),
        };
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// Schema para paginación del blog
export interface PaginationSchemaProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
}

export function generatePaginationLinks({ currentPage, totalPages, baseUrl }: PaginationSchemaProps) {
    const links: { rel: string; href: string }[] = [];

    if (currentPage > 1) {
        links.push({
            rel: 'prev',
            href: currentPage === 2 ? baseUrl : `${baseUrl}?page=${currentPage - 1}`,
        });
    }

    if (currentPage < totalPages) {
        links.push({
            rel: 'next',
            href: `${baseUrl}?page=${currentPage + 1}`,
        });
    }

    return links;
}
