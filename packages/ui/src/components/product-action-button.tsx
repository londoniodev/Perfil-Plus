import * as React from "react";
import { Button, ButtonProps } from "../button";
import { useDigitalProduct } from "../hooks/use-digital-product";
import { Product, ProductType } from "@alvarosky/shared";
import { Download, ShoppingCart, Repeat, Calendar } from "lucide-react";
import { cn } from "../lib/utils";

// Extended User interface to include purchases/orders for local check
interface ExtendedUser {
    id: string;
    orders?: any[];
    purchases?: any[];
    subscription?: {
        status: string;
    };
}

interface ProductActionButtonProps extends ButtonProps {
    product: Product;
    user?: ExtendedUser | null;
    onAddToCart?: () => void;
    onBuyNow?: () => void;
}

export function ProductActionButton({
    product,
    user,
    onAddToCart,
    onBuyNow,
    className,
    ...props
}: ProductActionButtonProps) {
    const { downloadProduct, isLoading } = useDigitalProduct();

    // Check if user has purchased
    const hasPurchased = React.useMemo(() => {
        if (!user) return false;

        // Check active subscription (if applicable logic exists in frontend)
        if (user.subscription?.status === 'ACTIVE') return true;

        // Check orders/purchases
        const inOrders = user.orders?.some((order: any) =>
            order.status === 'APPROVED' &&
            order.items?.some((item: any) => item.product?.id === product.id || item.variant?.productId === product.id)
        );

        if (inOrders) return true;

        const inLegacyPurchases = user.purchases?.some((p: any) =>
            p.status === 'approved' && p.productId === product.id
        );

        return !!inLegacyPurchases;
    }, [user, product]);

    // HANDLER: Download
    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await downloadProduct(product.id, product.name);
    };

    // RENDER LOGIC

    // 1. Digital Product + Purchased -> Download
    if (product.productType === "DIGITAL" && hasPurchased) {
        return (
            <Button
                onClick={handleDownload}
                disabled={isLoading}
                className={cn("w-full bg-blue-600 hover:bg-blue-700 text-white gap-2", className)}
                {...props}
            >
                <Download className="h-4 w-4" />
                {isLoading ? "Preparando..." : "Descargar Ahora"}
            </Button>
        );
    }

    // 2. Physical Product + Purchased -> Buy Again
    if (product.productType === "PHYSICAL" && hasPurchased) {
        return (
            <Button
                onClick={onAddToCart} // Or onBuyNow
                variant="outline"
                className={cn("w-full gap-2", className)}
                {...props}
            >
                <Repeat className="h-4 w-4" />
                Comprar de nuevo
            </Button>
        );
    }

    // 3. Service -> Schedule (Placeholder logic, usually leads to booking)
    if (product.productType === "SERVICE") {
        return (
            <Button
                onClick={onBuyNow} // Could be open calendar
                className={cn("w-full gap-2", className)}
                {...props}
            >
                <Calendar className="h-4 w-4" />
                Agendar
            </Button>
        );
    }

    // 4. Default: Add to Cart (Digital or Physical not purchased)
    return (
        <Button
            onClick={onAddToCart}
            className={cn("w-full gap-2", className)}
            {...props}
        >
            <ShoppingCart className="h-4 w-4" />
            Agregar al Carrito
        </Button>
    );
}
