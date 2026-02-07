"use client"

import { Badge, Button, DataTable, PriceDisplay, AdaptiveImage } from "@alvarosky/ui"
import Link from "next/link"

interface ProductTableData {
    id: string
    name: string
    image: string
    type: string
    price: number
    stock: string | number
    published: boolean
    createdAt: Date
}

interface ProductsTableProps {
    data: ProductTableData[]
}

export function ProductsTable({ data }: ProductsTableProps) {
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

    return <DataTable data={data} columns={columns} />
}
