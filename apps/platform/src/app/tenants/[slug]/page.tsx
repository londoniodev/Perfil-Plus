import Link from "next/link";
import { notFound } from "next/navigation";
import { prismaManagement } from "@alvarosky/database-management";
import { Card, Button, Badge } from "@alvarosky/ui";
import { TenantSettingsEditor } from "@/components/tenant-settings-editor";

export const dynamic = "force-dynamic";

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function TenantDetailPage({ params }: Props) {
    const { slug } = await params;

    const tenant = await prismaManagement.tenant.findUnique({
        where: { slug },
    });

    if (!tenant) {
        notFound();
    }

    return (
        <main className="container mx-auto p-8">
            <Link href="/tenants" className="text-sm text-muted-foreground hover:underline mb-4 block">
                ← Volver a Tenants
            </Link>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">{tenant.name}</h1>
                    <p className="text-muted-foreground">
                        Slug: {tenant.slug} | DB: {tenant.dbName}
                    </p>
                </div>
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
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Información</h2>
                    <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Plan:</dt>
                            <dd className="font-medium">{tenant.plan}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Email:</dt>
                            <dd className="font-medium">{tenant.ownerEmail || "—"}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Creado:</dt>
                            <dd className="font-medium">
                                {new Date(tenant.createdAt).toLocaleDateString("es-CO")}
                            </dd>
                        </div>
                    </dl>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Configuración (SystemSettings)</h2>
                    <TenantSettingsEditor tenantSlug={tenant.slug} tenantDbName={tenant.dbName} />
                </Card>
            </div>

            {tenant.notes && (
                <Card className="p-6 mt-6 bg-destructive/10">
                    <h2 className="text-lg font-semibold text-destructive mb-2">Notas / Errores</h2>
                    <pre className="text-sm text-destructive whitespace-pre-wrap">{tenant.notes}</pre>
                </Card>
            )}
        </main>
    );
}
