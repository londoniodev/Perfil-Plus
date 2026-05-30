import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

/**
 * Webhook de Revalidación On-Demand (Cross-App)
 * 
 * Acepta peticiones POST desde la API (NestJS) para invalidar la caché ISR
 * de Next.js cuando se actualizan datos del tenant (BrandSettings, branding, etc.)
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { tag, path } = body;

        // Validar secreto de revalidación estrictamente
        const secret = req.headers.get("x-revalidate-secret") || body.secret;
        const expectedSecret = process.env.REVALIDATION_SECRET || process.env.INTERNAL_API_KEY;

        if (!expectedSecret || secret !== expectedSecret) {
            console.warn(`[ISR Webhook] Unauthorized attempt`);
            return new Response('Unauthorized', { status: 401 });
        }

        if (!tag && !path) {
            return NextResponse.json({ message: "Missing tag or path parameter" }, { status: 400 });
        }

        if (tag && typeof tag === 'string') {
            // API estándar de Next.js App Router (1 solo argumento string)
            // Se usa cast a any para satisfacer definiciones de tipos locales divergentes
            (revalidateTag as any)(tag);
            console.log(`[ISR Webhook] Tag invalidado: ${tag}`);
        }

        if (path) {
            revalidatePath(path);
            console.log(`[Revalidate Webhook] Path invalidado: ${path}`);
        } else {
            // Por defecto, si hay tag, también revalidamos el path raíz para asegurar que el layout se refresque
            revalidatePath('/', 'layout');
            console.log(`[Revalidate Webhook] Path raíz (layout) invalidado por defecto.`);
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
