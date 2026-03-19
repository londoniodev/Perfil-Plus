import { NextRequest, NextResponse } from "next/server";
import { updateTag, revalidatePath } from "next/cache";

/**
 * Webhook de Revalidación On-Demand (Cross-App)
 * 
 * Acepta peticiones POST desde la API (NestJS) para invalidar la caché ISR
 * de Next.js cuando se actualizan datos del tenant (BrandSettings, branding, etc.)
 * 
 * Seguridad: Valida contra REVALIDATION_SECRET.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { tag, path } = body;

        // Validar secreto de revalidación estrictamente
        const secret = req.headers.get("x-revalidate-secret") || body.secret;
        const expectedSecret = process.env.REVALIDATION_SECRET;

        if (!expectedSecret || secret !== expectedSecret) {
            console.warn(`[Revalidate Webhook] Intento de revalidación no autorizado`);
            return new Response('Unauthorized', { status: 401 });
        }

        if (!tag && !path) {
            return NextResponse.json({ message: "Missing tag or path parameter" }, { status: 400 });
        }

        if (tag) {
            // Usamos updateTag para invalidación inmediata de un solo tag (Next.js 16/15)
            updateTag(tag);
            console.log(`[Revalidate Webhook] Tag invalidado: ${tag}`);
        }

        if (path) {
            revalidatePath(path);
            console.log(`[Revalidate Webhook] Path invalidado: ${path}`);
        }

        return NextResponse.json({ 
            revalidated: true, 
            now: Date.now(), 
            tag: tag || null, 
            path: path || null 
        });
    } catch (err: any) {
        console.error(`[Revalidate Webhook] Fallo crítico:`, err.message);
        return NextResponse.json({ message: "Error revalidating", error: err.message }, { status: 500 });
    }
}
