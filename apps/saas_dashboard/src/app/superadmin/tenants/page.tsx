import { TenantsTable } from "@/components/superadmin/tenants-table";
import { headers } from "next/headers";

export default async function TenantsPage() {
    const headersList = await headers();
    // Resolviendo la URL de la API (Backend)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api";

    let tenants = [];
    let error = null;

    try {
        const res = await fetch(`${API_URL}/tenant`, {
            headers: {
                // IMPORTANT: Reenviamos las cookies para que NestJS reconozca la sesión del SuperAdmin
                'Cookie': headersList.get('cookie') || '',
            },
            cache: 'no-store' // Para SuperAdmin queremos datos frescos siempre
        });

        if (res.ok) {
            tenants = await res.json();
        } else {
            error = `Error ${res.status}: ${res.statusText || 'Acceso denegado'}`;
        }
    } catch (err) {
        console.error("Failed to fetch tenants:", err);
        error = "Error de conexión con la API central";
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Administración de Inquilinos (Tenants)
                </h1>
            </div>
            
            {error && (
                <div className="p-4 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 text-sm">
                     <strong>Aviso:</strong> {error}
                </div>
            )}

            <TenantsTable data={tenants as any} />
        </div>
    );
}
