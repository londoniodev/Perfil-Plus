import { PrismaClient } from "@prisma/client"
import { ProductForm } from "@/components/admin/products/product-form"
import { PageHeader } from "@alvarosky/ui"
import { notFound } from "next/navigation"
import { BreadcrumbSetter } from "@/components/layout/breadcrumb-setter"

const prisma = new PrismaClient()

interface EditMenuPageProps {
    params: Promise<{ id: string }>
}

async function getProduct(id: string) {
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            variants: true,
            modifierGroups: {
                include: {
                    modifiers: {
                        orderBy: { createdAt: 'asc' }
                    }
                },
                orderBy: { createdAt: 'asc' }
            }
        }
    })

    if (!product) return null

    // Transform decimal to number for form
    return {
        ...product,
        basePrice: Number(product.basePrice),
        variants: product.variants.map(v => ({
            ...v,
            price: Number(v.price)
        })),
        modifierGroups: product.modifierGroups.map(g => ({
            ...g,
            modifiers: g.modifiers.map(m => ({
                ...m,
                priceAdjustment: Number(m.priceAdjustment)
            }))
        }))
    }
}

export default async function EditMenuPage({ params }: EditMenuPageProps) {
    const { id } = await params
    const product = await getProduct(id)

    if (!product) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Editar Menú"
                description={`Editando: ${product.name}`}
            />
            <BreadcrumbSetter segment={id} label={product.name} />
            <ProductForm initialData={product} />
        </div>
    )
}
