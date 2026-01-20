import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth-server"
import { prisma } from "@alvarosky/database"
import { PageHeader, Button, Badge, DataTable, PriceDisplay, AdaptiveImage } from "@alvarosky/ui"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function ProductsPage() {
    // 1. Verificar autenticación y rol
    const user = await getSessionUser()

    if (!user) {
        redirect("/auth/login")
    }

    if (user.role !== "ADMIN") {
        redirect("/")
    }

    // 2. Obtener productos con variantes
    const products = await prisma.product.findMany({
        include: {
            variants: {
                select: {
                    stock: true,
                    price: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    // 3. Transformar datos para DataTable
    const tableData = products.map((product) => {
        // Calcular stock total
        const totalStock = product.variants.reduce((sum, variant) => {
            if (variant.stock === -1) return Infinity
            return sum + variant.stock
        }, 0)

        // Precio mínimo de las variantes
        const minPrice = Math.min(
            Number(product.basePrice),
            ...product.variants.map(v => Number(v.price))
        )

        return {
            id: product.id,
            name: product.name,
            image: product.images[0] || "/placeholder.jpg",
            type: product.productType,
            price: minPrice,
            stock: totalStock === Infinity ? "Ilimitado" : totalStock,
            published: product.published,
            createdAt: product.createdAt
        }
    })

    // 4. Definir columnas
    const columns = [
        {
            accessorKey: "image",
            header: "Imagen",
            cell: ({ row }: any) => (
                <div className="h-12 w-12 overflow-hidden rounded border">
                    <AdaptiveImage
                        src={row.original.image}
                        aspectRatio="square"
                        alt={row.original.name}
                    />
                </div>
            )
        },
        {
            accessorKey: "name",
            header: "Nombre",
            cell: ({ row }: any) => (
                <div className="font-medium">{row.original.name}</div>
            )
        },
        {
            accessorKey: "type",
            header: "Tipo",
            cell: ({ row }: any) => (
                <Badge variant={row.original.type === "DIGITAL" ? "default" : "secondary"}>
                    {row.original.type === "DIGITAL" ? "Digital" : "Físico"}
                </Badge>
            )
        },
        {
            accessorKey: "price",
            header: "Precio",
            cell: ({ row }: any) => (
                <PriceDisplay price={row.original.price} size="sm" />
            )
        },
        {
            accessorKey: "stock",
            header: "Stock",
            cell: ({ row }: any) => (
                <span className="text-sm">
                    {row.original.stock}
                </span>
            )
        },
        {
            accessorKey: "published",
            header: "Estado",
            cell: ({ row }: any) => (
                <Badge variant={row.original.published ? "default" : "outline"}>
                    {row.original.published ? "Publicado" : "Borrador"}
                </Badge>
            )
        },
        {
            id: "actions",
            header: "Acciones",
            cell: ({ row }: any) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/products/${row.original.id}`}>
                            Editar
                        </Link>
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Productos"
                    description="Gestiona el catálogo de tu tienda"
                />
                <Button asChild>
                    <Link href="/admin/products/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Producto
                    </Link>
                </Button>
            </div>

            <DataTable
                data={tableData}
                columns={columns}
            />
        </div>
    )
}

