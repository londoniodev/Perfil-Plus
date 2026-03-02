import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth-server"
import { AdminPageWrapper } from "@alvarosky/ui"
import { getRecipes, getAllProductsForRecipe, getInventoryItems, getAllProductsCost } from "@/actions/admin/inventory"
import { RecipesClient } from "@/components/inventory/RecipesClient"

export default async function RecipesPage() {
    const user = await getSessionUser()
    if (!user) redirect("/login")
    if (user.role !== "ADMIN") redirect("/")

    const [recipes, allProducts, inventoryItems, productsCost] = await Promise.all([
        getRecipes(),
        getAllProductsForRecipe(),
        getInventoryItems(),
        getAllProductsCost()
    ])

    return (
        <AdminPageWrapper
            title="Recetas (BOM)"
            description="Define los ingredientes y cantidades para cada plato del menú"
        >
            <RecipesClient
                recipes={recipes}
                allProducts={allProducts}
                inventoryItems={inventoryItems}
                productsCost={productsCost}
            />
        </AdminPageWrapper>
    )
}
