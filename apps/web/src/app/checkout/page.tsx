import { PageHeader } from "@mauromera/ui";

export default function CheckoutPage() {
    return (
        <div className="container py-12">
            <PageHeader
                title="Finalizar Compra"
                description="Revisa tu pedido y completa el pago."
            />
            <div className="mt-8 p-12 border border-dashed rounded-lg text-center text-muted-foreground">
                <p>El proceso de checkout se implementará próximamente.</p>
                <p className="text-sm mt-2">Integración con pasarela de pagos pendiente.</p>
            </div>
        </div>
    );
}
