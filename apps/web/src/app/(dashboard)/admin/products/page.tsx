import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth-server"
import { prisma } from "@mauromera/database"
import { PageHeader, Button, Badge, DataTable, PriceDisplay, AdaptiveImage } from "@mauromera/ui"
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
            key: "image" as const,
            header: "Imagen",
            cell: (row: typeof tableData[0]) => (
                <div className="h-12 w-12 overflow-hidden rounded border">
                    <AdaptiveImage
                        src={row.image}
                        aspectRatio="square"
                        alt={row.name}
                    />
                </div>
            )
        },
        {
            key: "name" as const,
            header: "Nombre",
            cell: (row: typeof tableData[0]) => (
                <div className="font-medium">{row.name}</div>
            )
        },
        {
            key: "type" as const,
            header: "Tipo",
            cell: (row: typeof tableData[0]) => (
                <Badge variant={row.type === "DIGITAL" ? "default" : "secondary"}>
                    {row.type === "DIGITAL" ? "Digital" : "Físico"}
                </Badge>
            )
        },
        {
            key: "price" as const,
            header: "Precio",
            cell: (row: typeof tableData[0]) => (
                <PriceDisplay price={row.price} size="sm" />
            )
        },
        {
            key: "stock" as const,
            header: "Stock",
            cell: (row: typeof tableData[0]) => (
                <span className="text-sm">
                    {row.stock}
                </span>
            )
        },
        {
            key: "published" as const,
            header: "Estado",
            cell: (row: typeof tableData[0]) => (
                <Badge variant={row.published ? "default" : "outline"}>
                    {row.published ? "Publicado" : "Borrador"}
                </Badge>
            )
        },
        {
            key: "id" as const,
            header: "Acciones",
            cell: (row: typeof tableData[0]) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/products/${row.id}`}>
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
