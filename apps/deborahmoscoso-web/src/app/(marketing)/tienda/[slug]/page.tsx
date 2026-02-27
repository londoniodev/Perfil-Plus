import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";
import { ProductDetailClient } from "./ProductDetailClient";
import { Metadata } from "next";

interface ProductPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
        return {
            title: "Producto no encontrado",
        };
    }

    return {
        title: `${product.name} | Deborah Moscoso`,
        description: product.description || `Adquiere ${product.name} en la tienda oficial de Deborah Moscoso.`,
        openGraph: {
            title: product.name,
            description: product.description || `Adquiere ${product.name} en la tienda oficial de Deborah Moscoso.`,
            images: product.images[0] ? [{ url: product.images[0] }] : [],
        },
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product || !product.published) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(product.id, product.productType);

    return (
        <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    );
}
