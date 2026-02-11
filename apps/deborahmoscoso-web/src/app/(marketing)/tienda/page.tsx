import { Fill } from "@alvarosky/ui";
import { getStoreProducts } from "@/lib/data";
import { StorePageClient } from "./StorePageClient";

export const dynamic = "force-dynamic";

export default async function TiendaPage() {
    const products = await getStoreProducts();

    return (
        <Fill>
            <StorePageClient products={products} />
        </Fill>
    );
}
