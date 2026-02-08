import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface RouteParams {
    params: Promise<{ slug: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    const { slug } = await params;

    try {
        // Get tenant info from management DB
        const { prismaManagement } = await import("@alvarosky/database-management");
        const tenant = await prismaManagement.tenant.findUnique({
            where: { slug },
        });

        if (!tenant) {
            return NextResponse.json(
                { error: "Tenant not found" },
                { status: 404 }
            );
        }

        // Get database credentials from master URL
        const masterUrl = process.env.DATABASE_URL;
        if (!masterUrl) {
            return NextResponse.json(
                { error: "DATABASE_URL not configured" },
                { status: 500 }
            );
        }

        // Build tenant-specific DATABASE_URL by cloning and modifying master URL
        const tenantUrl = new URL(masterUrl);
        tenantUrl.pathname = `/${tenant.dbName}`;
        const tenantDbUrl = tenantUrl.toString();

        console.log(`[Migrate] Starting schema push for tenant: ${slug} (${tenant.dbName})`);

        // Determine the correct paths based on environment
        // In Docker: /app/packages/database/prisma/schema.prisma
        // In local dev: ../../packages/database/prisma/schema.prisma
        const isDocker = process.env.NODE_ENV === "production" || process.cwd().startsWith("/app");

        const schemaPath = isDocker
            ? "/app/packages/database/prisma/schema.prisma"
            : "../../packages/database/prisma/schema.prisma";

        const prismaPath = isDocker
            ? "prisma"
            : "npx prisma";

        const command = `${prismaPath} db push --schema=${schemaPath} --skip-generate --accept-data-loss`;

        console.log(`[Migrate] Command: ${command}`);
        console.log(`[Migrate] Working directory: ${process.cwd()}`);

        const { stdout, stderr } = await execAsync(command, {
            env: {
                ...process.env,
                DATABASE_URL: tenantDbUrl,
            },
            cwd: isDocker ? "/app" : process.cwd(),
            timeout: 60000, // 60 seconds timeout
        });

        console.log(`[Migrate] stdout: ${stdout}`);
        if (stderr) console.warn(`[Migrate] stderr: ${stderr}`);

        // Update tenant notes to log migration
        await prismaManagement.tenant.update({
            where: { slug },
            data: {
                notes: `Last schema sync: ${new Date().toISOString()}\n${tenant.notes || ""}`,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            message: `Schema pushed successfully to ${tenant.dbName}`,
            output: stdout,
        });
    } catch (error) {
        console.error("[Migrate] Error:", error);

        const errorMessage = error instanceof Error ? error.message : String(error);

        return NextResponse.json(
            {
                error: "Migration failed",
                details: errorMessage,
            },
            { status: 500 }
        );
    }
}
