import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================================
// TENANT RESOLUTION MIDDLEWARE (HYBRID EDGE)
// ============================================================================

// Dominios base de la plataforma Dokploy/Vercel/Local que NO requieren buscar custom domains
const BASE_DOMAINS = [
    'localhost',
    '127.0.0.1',
    'vercel.app',
    'dokploy.com' // Ajustable si usas tu propio root domain proxy
];

function isBaseDomain(hostname: string): boolean {
    const host = hostname.split(':')[0]; // Remover puerto si lo hay
    return BASE_DOMAINS.some(domain => host === domain || host.endsWith(`.${domain}`));
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const hostname = request.headers.get('host') || '';
    const cleanHostname = hostname.split(':')[0];

    // 1. Identidad Híbrida: Por defecto, heredamos el ENV the Dokploy o .env local
    let tenantId = process.env.NEXT_PUBLIC_TENANT_ID || 'default';

    // 2. Si es un Custom Domain, intentamos resolver dinámicamente en NestJS
    if (!isBaseDomain(cleanHostname)) {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            // Petición al API the Múlti-tenancy the NestJS
            const res = await fetch(`${apiUrl}/tenant/identify?domain=${cleanHostname}`, {
                next: { revalidate: 300 } // Pequeño caché the 5 mins en Vercel/Next para no saturar al API
            });

            if (res.ok) {
                const data = await res.json();
                if (data.id) {
                    tenantId = data.id; // ¡Custom Domain Resuelto Exitosamente!
                }
            } else {
                console.warn(`Tenant resolution failed or missing for custom domain: ${cleanHostname}`);
                // Fallback a proces.env ya asignado arriba
            }
        } catch (e) {
            console.error(`Middleware Error fetching tenant identity for ${cleanHostname}:`, e);
            // Fallback en caso de timeout
        }
    }

    // 3. Inyectar tenant ID resuelto en los headers de la petición para Server Components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-id', tenantId);

    // 3. Auth Protection Logic
    const token = request.cookies.get('accessToken') || request.cookies.get('Authentication');

    const protectedPaths = [
        '/perfil',
        '/cursos',
        '/suscripcion',
        '/mis-compras',
        '/admin',
    ];

    const isProtected = protectedPaths.some(path => pathname.startsWith(path));

    if (isProtected && !token) {
        const url = new URL('/login', request.url);
        url.searchParams.set('redirect', pathname);
        url.searchParams.set('error', 'session_missing');
        return NextResponse.redirect(url);
    }

    // 4. Redirect authenticated users away from auth pages
    const authPaths = ['/login', '/registro'];
    const isAuthPage = authPaths.some(path => pathname === path);

    if (isAuthPage && token) {
        return NextResponse.redirect(new URL('/perfil', request.url));
    }

    // 5. App-like behavior: Root redirects to perfil si está autenticado y no es marketing base (opcional)
    if (pathname === '/' && token) {
        // En frontend_audit_report recomendó revisar estas redirecciones globales. 
        // Si el ecommerce debe mostrar home, remover esto. Lo dejaremos intacto por compatibilidad.
        // return NextResponse.redirect(new URL('/perfil', request.url));
    }

    // 6. Retornar el NextResponse inyectando el objeto request modificado
    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|images|fonts|.*\\..*|api).*)',
    ],
};
