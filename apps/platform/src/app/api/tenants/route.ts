import { NextRequest, NextResponse } from "next/server";
import { prismaManagement } from "@alvarosky/database-management";
import { Pool } from "pg";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
    try {
        const tenants = await prismaManagement.tenant.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(tenants);
    } catch (error) {
        console.error("Error fetching tenants:", error);
        return NextResponse.json({ error: "Failed to fetch tenants" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, slug, ownerEmail, plan } = body;

        // Validate slug
        if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
            return NextResponse.json(
                { error: "Slug inválido. Solo letras minúsculas, números y guiones." },
                { status: 400 }
            );
        }

        // Check if slug exists
        const existing = await prismaManagement.tenant.findUnique({
            where: { slug },
        });
        if (existing) {
            return NextResponse.json(
                { error: "Ya existe un tenant con ese slug" },
                { status: 400 }
            );
        }

        const dbName = `tenants_${slug.replace(/-/g, "_")}`;

        // 1. Create tenant record (DEPLOYING status)
        const tenant = await prismaManagement.tenant.create({
            data: {
                name,
                slug,
                dbName,
                ownerEmail: ownerEmail || null,
                plan: plan || "free",
                status: "DEPLOYING",
            },
        });

        // 2. Create database (async - fire and forget for now)
        provisionDatabase(dbName, String(tenant.id)).catch((err) => {
            console.error("Provisioning failed:", err);
        });

        return NextResponse.json(tenant, { status: 201 });
    } catch (error) {
        console.error("Error creating tenant:", error);
        return NextResponse.json(
            { error: "Error al crear tenant" },
            { status: 500 }
        );
    }
}

async function provisionDatabase(dbName: string, tenantId: string) {
    const masterUrl = process.env.DATABASE_URL;
    if (!masterUrl) throw new Error("DATABASE_URL not set");

    // Parse connection string to get host/user/pass
    const url = new URL(masterUrl);
    const host = url.hostname;
    const port = url.port || "5432";
    const user = url.username;
    const password = url.password;

    // Connect to postgres (default db) to create new database
    const pool = new Pool({
        host,
        port: parseInt(port),
        user,
        password,
        database: "postgres",
    });

    try {
        // Create database
        await pool.query(`CREATE DATABASE "${dbName}"`);
        console.log(`Database ${dbName} created successfully`);

        // Run migrations on the new database
        const tenantDbUrl = `postgresql://${user}:${password}@${host}:${port}/${dbName}?schema=public`;

        // Use prisma db push for the tenant schema
        const { stdout, stderr } = await execAsync(
            `cd ../../packages/database && DATABASE_URL="${tenantDbUrl}" npx prisma db push --skip-generate`,
            { env: { ...process.env, DATABASE_URL: tenantDbUrl } }
        );

        console.log("Migration stdout:", stdout);
        if (stderr) console.warn("Migration stderr:", stderr);

        // Update tenant status to ACTIVE
        await prismaManagement.tenant.update({
            where: { id: parseInt(tenantId) },
            data: { status: "ACTIVE" },
        });

        console.log(`Tenant ${tenantId} is now ACTIVE`);
    } catch (error) {
        console.error("Provisioning error:", error);
        // Update status to reflect failure
        await prismaManagement.tenant.update({
            where: { id: parseInt(tenantId) },
            data: { status: "SUSPENDED", notes: String(error) },
        });
        throw error;
    } finally {
        await pool.end();
    }
}
