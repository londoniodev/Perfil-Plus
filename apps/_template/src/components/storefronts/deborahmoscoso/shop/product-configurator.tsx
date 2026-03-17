"use client"

import { ProductConfigurator as SharedProductConfigurator, AddToCartItem } from "@alvarosky/ui"
import { Product, ProductVariant } from "@alvarosky/database"
import { useCart } from "@/store/use-cart"

interface ProductConfiguratorProps {
    product: any // Temporarily use any since the internal components transform and cast it correctly
}

export function ProductConfigurator({ product }: ProductConfiguratorProps) {
    const cart = useCart()

    const handleAddToCart = (item: AddToCartItem) => {
        cart.addItem({
            productId: item.productId,
            variantId: item.variantId,
            title: item.title,
            subtitle: item.subtitle,
            imageSrc: item.imageSrc,
            price: item.price,
            quantity: item.quantity,
            productType: item.productType as "DIGITAL" | "PHYSICAL" | "SERVICE"
        })
    }

    // Transform Prisma product to shared component format
    const productData = {
        id: product.id,
        name: product.name,
        description: product.description,
        images: product.images,
        productType: product.productType as "PHYSICAL" | "DIGITAL",
        specs: product.specs as Record<string, string | number> | undefined,
        variants: product.variants.map((v: any) => ({
            id: v.id,
            name: v.name,
            price: Number(v.price),
            stock: v.stock,
            isDefault: v.isDefault
        }))
    }

    return (
        <SharedProductConfigurator
            product={productData}
            onAddToCart={handleAddToCart}
        />
    )
}
