import Link from "next/link";
import { prismaManagement } from "@alvarosky/database-management";
import {
    Button,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@alvarosky/ui";
import { TenantsTable } from "@/components/tenants-table";

export const dynamic = "force-dynamic";

export default async function TenantsPage() {
    const tenants = await prismaManagement.tenant.findMany({
        orderBy: { createdAt: "desc" },
    });

    const activeCount = tenants.filter(t => t.status === "ACTIVE").length;

    return (
        <main className="container mx-auto py-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <Breadcrumb className="mb-2">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-indigo-400">Tenants</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <h2 className="text-3xl font-bold text-white">Tenants</h2>
                    <p className="text-slate-400 mt-1">
                        {activeCount} activo{activeCount !== 1 ? "s" : ""} de {tenants.length} total
                    </p>
                </div>
                <Link href="/tenants/new">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Nuevo Tenant
                    </Button>
                </Link>
            </div>

            {/* Tenants Table */}
            <TenantsTable data={tenants} />
        </main>
    );
}
