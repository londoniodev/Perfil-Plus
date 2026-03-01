import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth-server"
import { AdminPageWrapper } from "@alvarosky/ui"
import { getRecipes, getProductsWithoutRecipe, getInventoryItems } from "@/actions/admin/inventory"
import { RecipesClient } from "@/components/inventory/RecipesClient"

export default async function RecipesPage() {
    const user = await getSessionUser()
    if (!user) redirect("/login")
    if (user.role !== "ADMIN") redirect("/")

    const [recipes, productsWithoutRecipe, inventoryItems] = await Promise.all([
        getRecipes(),
        getProductsWithoutRecipe(),
        getInventoryItems(),
    ])

    return (
        <AdminPageWrapper
            title="Recetas (BOM)"
            description="Define los ingredientes y cantidades para cada plato del menú"
        >
            <RecipesClient
                recipes={recipes}
                productsWithoutRecipe={productsWithoutRecipe}
                inventoryItems={inventoryItems}
            />
        </AdminPageWrapper>
    )
}
