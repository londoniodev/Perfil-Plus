import { notFound } from "next/navigation"
import { serverFetch } from "@/lib/api-server"
import { ProductConfigurator } from "@/components/shop/product-configurator"
import { headers } from "next/headers"
import { Metadata } from "next"
import { getTenantFeatures } from "@alvarosky/shared"
import { getDynamicUrl } from "@/lib/network"
import { TenantFeature } from "@alvarosky/features"
import { ProductSchema } from "@/components/seo/JsonLd"
import { getTenantDesign } from "@/lib/tenant-server"
import { ProductPageBackButton } from "@/components/shop/product-back-button"

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

    const tenantId = headersList.get("x-tenant-id") || "template";
    const design = await getTenantDesign(tenantId);
    const url = getDynamicUrl(headersList);
    const primaryColor = design?.brandSettings?.primaryColor || design?.primary || '#e11d48';

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
        <div className="min-h-[calc(100vh-4rem)] bg-zinc-950 flex flex-col">
            <ProductSchema 
                product={product} 
                url={url} 
                businessName={design?.name || "Tienda"} 
            />
            <div className="container py-6 md:py-8 relative z-10 flex-1">
                {/* Botón de regreso con color del tenant */}
                <ProductPageBackButton primaryColor={primaryColor} productName={product.name} />

                {/* Renderizamos el Cliente Component */}
                <div className="dark text-foreground mt-4">
                    <ProductConfigurator product={product} />
                </div>
            </div>
        </div>
    )
}

