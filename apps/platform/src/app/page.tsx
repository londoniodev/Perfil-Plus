import Link from "next/link";
import { Card, Button } from "@alvarosky/ui";

export default function HomePage() {
    return (
        <main className="container mx-auto p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Platform Admin</h1>
                <p className="text-muted-foreground">Control Tower - Gestión de Tenants</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-2">Tenants</h2>
                    <p className="text-muted-foreground mb-4">
                        Gestiona los clientes y sus bases de datos
                    </p>
                    <Link href="/tenants">
                        <Button>Ver Tenants</Button>
                    </Link>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-2">Crear Tenant</h2>
                    <p className="text-muted-foreground mb-4">
                        Provisionar nueva base de datos de cliente
                    </p>
                    <Link href="/tenants/new">
                        <Button variant="outline">+ Nuevo Tenant</Button>
                    </Link>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-2">Configuración</h2>
                    <p className="text-muted-foreground mb-4">
                        Ajustes globales de la plataforma
                    </p>
                    <Button variant="secondary" disabled>
                        Próximamente
                    </Button>
                </Card>
            </div>
        </main>
    );
}
