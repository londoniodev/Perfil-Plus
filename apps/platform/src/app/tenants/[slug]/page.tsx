import Link from "next/link";
import { notFound } from "next/navigation";
import { prismaManagement } from "@alvarosky/database-management";
import { Badge } from "@alvarosky/ui";
import { TenantConfigPanel } from "@/components/tenant-config-panel";
import { LogoutButton } from "@/components/logout-button";

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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col">
            {/* Header */}
            <header className="relative border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl z-10">
                <div className="container mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/tenants" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="hidden sm:inline text-sm">Tenants</span>
                        </Link>
                        <span className="text-slate-700">/</span>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                                <span className="text-sm font-bold text-indigo-400">
                                    {(tenant.name || tenant.slug).charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h1 className="text-sm lg:text-base font-semibold text-white truncate max-w-[150px] sm:max-w-none">
                                    {tenant.name || tenant.slug}
                                </h1>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        className={`text-[10px] px-1.5 py-0 ${tenant.status === "ACTIVE"
                                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                                : tenant.status === "DEPLOYING"
                                                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                                    : "bg-red-500/20 text-red-400 border-red-500/30"
                                            }`}
                                    >
                                        {tenant.status}
                                    </Badge>
                                    <span className="text-xs text-slate-500 hidden sm:inline font-mono">
                                        {tenant.dbName}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </header>

            {/* Main Content - Full height config panel */}
            <main className="flex-1 flex min-h-0">
                <TenantConfigPanel tenantSlug={tenant.slug} tenantDbName={tenant.dbName} />
            </main>
        </div>
    );
}
