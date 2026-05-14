import { notFound } from "next/navigation"
import { serverFetch } from "@/lib/api-server"
import { PageHeader } from "@alvarosky/ui"
import { ProductConfigurator } from "@/components/shop/product-configurator"
import { headers } from "next/headers"
import { Metadata } from "next"
import { getTenantFeatures } from "@alvarosky/shared"
import { TenantFeature } from "@alvarosky/features"

interface ProductPageProps {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const { slug } = await params;
    const headersList = await headers();
    const features = getTenantFeatures(headersList);

    // Protección de ruta por Feature
    const shopFeature: TenantFeature = "SHOP";
    if (!features.has(shopFeature)) {
        return { title: "No encontrado" };
    }

    const product = await serverFetch<any>(`/store/products/${slug}`).catch(() => null);

    if (!product) {
        return {
            title: "Producto no encontrado",
        };
    }

    const title = product.name;
    const description = product.description || `Compra ${product.name} en nuestra tienda.`;
    const productCover = product.coverImage || product.images?.[0] || null;

    return {
        title,
        description,
        openGraph: {
            type: 'website',
            title,
            description,
            url: `/tienda/${slug}`,
            images: productCover ? [{ url: productCover, width: 1200, height: 630, alt: product.name }] : [],
        },
        alternates: { canonical: `/tienda/${slug}` },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: productCover ? [productCover] : [],
        }
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params
    const headersList = await headers();
    const features = getTenantFeatures(headersList);

    // Protección de ruta por Feature
    const shopFeature: TenantFeature = "SHOP";
    if (!features.has(shopFeature)) {
        return notFound();
    }

    const product = await serverFetch<any>(`/store/products/${slug}`).catch(() => null);

    if (!product) {
        return notFound()
    }

    // Si no hay variantes activas (edge case), mostramos mensaje
    if (product.variants.length === 0) {
        return (
            <div className="container py-20">
                <p className="text-center text-muted-foreground">
                    Este producto no está disponible actualmente.
                </p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col pt-24">
            <div className="container py-8 md:py-12 relative z-10">
                {/* Breadcrumbs simplificados */}
                <div className="hidden md:block mb-8">
                    <PageHeader
                        title="Tienda"
                        description={`/ ${product.name}`}
                        className="py-0 md:py-0 text-white"
                    />
                </div>

                {/* Renderizamos el Cliente Component */}
                <div className="dark text-foreground">
                    <ProductConfigurator product={product} />
                </div>
            </div>
        </div>
    )
}
