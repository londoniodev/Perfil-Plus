import { Metadata } from "next";
import { notFound } from "next/navigation";
import EbookDetailClient from "./EbookDetailClient";
import { ProductSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import { API_BASE, TENANT_ID } from "@/lib/config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mauromera.com";

import { Ebook } from "@/types/ecommerce";

interface EbookPageProps {
    params: Promise<{ slug: string }>;
}

async function getEbook(slug: string): Promise<Ebook | null> {
    try {
        const res = await fetch(`${API_BASE}/ebooks/${slug}`, {
            next: { revalidate: 60 },
            headers: { 'x-tenant-id': TENANT_ID },
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }: EbookPageProps): Promise<Metadata> {
    const { slug } = await params;
    const ebook = await getEbook(slug);

    if (!ebook) {
        return { title: "E-book no encontrado | Mauro Mera" };
    }

    return {
        title: `${ebook.title} | E-books`,
        description: ebook.description,
        openGraph: {
            title: ebook.title,
            description: ebook.description,
            type: "book",
            url: `${SITE_URL}/ebooks/${slug}`,
            images: ebook.coverImage ? [{ url: ebook.coverImage, alt: ebook.title }] : [],
        },
        twitter: {
            card: "summary_large_image",
            title: ebook.title,
            description: ebook.description,
            images: ebook.coverImage ? [ebook.coverImage] : [],
        },
        alternates: {
            canonical: `/ebooks/${slug}`,
        },
    };
}

export default async function EbookDetailPage({ params }: EbookPageProps) {
    const { slug } = await params;
    const ebook = await getEbook(slug);

    if (!ebook) {
        notFound();
    }

    return (
        <>
            {/* Structured Data para SEO */}
            <ProductSchema
                name={ebook.title}
                description={ebook.description}
                url={`${SITE_URL}/ebooks/${slug}`}
                image={ebook.coverImage}
                price={ebook.price}
                datePublished={ebook.createdAt}
            />
            <BreadcrumbSchema items={[
                { name: "Inicio", url: SITE_URL },
                { name: "E-books", url: `${SITE_URL}/ebooks` },
                { name: ebook.title, url: `${SITE_URL}/ebooks/${slug}` },
            ]} />

            {/* Client Component para funcionalidad interactiva */}
            <EbookDetailClient ebook={ebook} />
        </>
    );
}
