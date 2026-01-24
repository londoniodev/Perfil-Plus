import { notFound } from "next/navigation";
import { prismaManagement } from "@alvarosky/database-management";
import { Badge } from "@alvarosky/ui";
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
            {/* Minimal Content Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center border border-sidebar-primary/30">
                        <span className="text-sm font-bold text-sidebar-primary-foreground">
                            {(tenant.name || tenant.slug).charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-foreground tracking-tight">
                            {tenant.name || tenant.slug}
                        </h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Badge
                                className={`text-[10px] px-1.5 py-0 border ${tenant.status === "ACTIVE"
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : tenant.status === "DEPLOYING"
                                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            : "bg-red-500/10 text-red-400 border-red-500/20"
                                    }`}
                            >
                                {tenant.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono">
                                {tenant.dbName}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Specific Actions */}
                <TenantHeaderActions tenantSlug={tenant.slug} />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-h-0">
                <TenantConfigPanel tenantSlug={tenant.slug} tenantDbName={tenant.dbName} />
            </div>
        </div>
    );
}
