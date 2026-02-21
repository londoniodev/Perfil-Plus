import { NextResponse } from "next/server"
import { prisma } from "@alvarosky/database"
import { getSessionUser } from "@/lib/auth-server"
import { revalidatePath } from "next/cache"

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSessionUser()

        if (!user || user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { id } = await params

        if (!id) {
            return new NextResponse("Missing product ID", { status: 400 })
        }

        const [_, product] = await prisma.$transaction([
            prisma.categoriesOnProducts.deleteMany({
                where: { productId: id }
            }),
            prisma.product.delete({
                where: {
                    id: id,
                },
            })
        ])

        // Revalidate the paths related to products
        revalidatePath("/admin/products")
        revalidatePath("/admin/restaurant/menu")

        return NextResponse.json(product)
    } catch (error) {
        console.error("Error deleting product:", error)
        return new NextResponse("Internal server error", { status: 500 })
    }
}
