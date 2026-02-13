import { PageHeader } from "@alvarosky/ui";
import { CheckoutForm } from "@/components/shop/checkout/checkout-form";

export default function CheckoutPage() {
    return (
        <div className="container py-12">
            <PageHeader
                title="Finalizar Compra"
                description="Revisa tu pedido y completa el pago."
            />
            <div className="mt-8">
                <CheckoutForm />
            </div>
        </div>
    );
}

