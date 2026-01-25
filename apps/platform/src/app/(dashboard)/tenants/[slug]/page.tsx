import Link from "next/link";
import { notFound } from "next/navigation";
import { prismaManagement } from "@alvarosky/database-management";
import {
    Badge,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@alvarosky/ui";
import { TenantConfigPanel } from "@/components/tenant-config-panel";
import { TenantHeaderActions } from "@/components/tenant-header-actions";

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
        <div className="flex flex-col gap-6">
            {/* Header Area */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/tenants">Tenants</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{tenant.name || tenant.slug}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <span className="text-lg font-bold">
                                {(tenant.name || tenant.slug).charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {tenant.name || tenant.slug}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant={tenant.status === "ACTIVE" ? "default" : "secondary"} className={
                                    tenant.status === "ACTIVE"
                                        ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-emerald-500/20"
                                        : ""
                                }>
                                    {tenant.status}
                                </Badge>
                                <span className="text-sm text-muted-foreground font-mono flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                    </svg>
                                    {tenant.dbName}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Specific Actions */}
                    <TenantHeaderActions tenantSlug={tenant.slug} />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-h-0">
                <TenantConfigPanel tenantSlug={tenant.slug} tenantDbName={tenant.dbName} />
            </div>
        </div>
    );
}
