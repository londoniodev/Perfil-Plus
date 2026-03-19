import { PrismaClient } from "@alvarosky/database";
import { TenantsTable } from "@/components/superadmin/tenants-table";

// Para no agotar conexiones en desarrollo (Singleton simple en página si no existe)
const prisma = new PrismaClient();

export default async function TenantsPage() {
    // Listar todos los tenants sin restricciones (Cross-Tenant)
    const tenants = await prisma.tenant.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Administración de Inquilinos (Tenants)
                </h1>
            </div>
            <TenantsTable data={tenants as any} />
        </div>
    );
}
