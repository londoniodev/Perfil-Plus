import Link from "next/link";
import { prismaManagement } from "@alvarosky/database-management";
import { Card, Button, Badge } from "@alvarosky/ui";

export const dynamic = "force-dynamic";

export default async function TenantsPage() {
    const tenants = await prismaManagement.tenant.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <main className="container mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Link href="/" className="text-sm text-muted-foreground hover:underline mb-2 block">
                        ← Volver al Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold">Tenants</h1>
                </div>
                <Link href="/tenants/new">
                    <Button>+ Nuevo Tenant</Button>
                </Link>
            </div>

            {tenants.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">No hay tenants creados aún</p>
                    <Link href="/tenants/new">
                        <Button>Crear primer tenant</Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {tenants.map((tenant) => (
                        <Card key={tenant.id} className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold">{tenant.name}</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Slug: {tenant.slug} | DB: {tenant.dbName}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge
                                        variant={
                                            tenant.status === "ACTIVE"
                                                ? "default"
                                                : tenant.status === "DEPLOYING"
                                                    ? "secondary"
                                                    : "destructive"
                                        }
                                    >
                                        {tenant.status}
                                    </Badge>
                                    <Link href={`/tenants/${tenant.slug}`}>
                                        <Button variant="outline" size="sm">
                                            Configurar
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </main>
    );
}
