import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://localhost:3001/api';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'default_dev_secret_key';

export async function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();

    // Leer el Host considerando que estamos detrás de un Reverse Proxy (Dokploy/Traefik)
    const hostname = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
    const cleanHostname = hostname.split(':')[0];
    console.log(`[DOKPLOY DEBUG] Raw Hostname: ${hostname} | Clean: ${cleanHostname}`);

    // Convert domain.com to domain (removes TLD for DB slug matching)
    let tenantSlugToQuery = cleanHostname;
    if (tenantSlugToQuery.startsWith('www.')) {
        tenantSlugToQuery = tenantSlugToQuery.substring(4);
    }
    // Remove everything after the first dot (matches 'mauromera.com' -> 'mauromera')
    tenantSlugToQuery = tenantSlugToQuery.split('.')[0];

    const isBaseDomain = ['localhost', '127'].includes(tenantSlugToQuery);

    let tenantId = process.env.NEXT_PUBLIC_TENANT_ID || 'default_tenant';
    let tenantFeatures: string[] = [];

    if (!isBaseDomain) {
        // Validación Fail-fast: INTERNAL_API_URL es obligatorio en producción
        if (!process.env.INTERNAL_API_URL && process.env.NODE_ENV === 'production') {
            console.error("[DOKPLOY ERROR] INTERNAL_API_URL is not defined. Edge Proxy cannot identify tenant.");
            url.pathname = '/500-internal-error'; // Opcional: ruta de error crítico
            return NextResponse.rewrite(url);
        }

        const fetchUrl = `${INTERNAL_API_URL}/tenant/identify?domain=${tenantSlugToQuery}`;
        try {
            // Petición al backend en Docker (misma red) para resolver host
            const res = await fetch(fetchUrl, {
                headers: {
                    'x-internal-token': INTERNAL_API_KEY
                }
            });

            if (res.ok) {
                const tenantData = await res.json();
                tenantId = tenantData.id;
                tenantFeatures = tenantData.features || [];
                console.log(`[DOKPLOY DEBUG] Edge Proxy Success: Tenant ID identified as ${tenantId}, features: ${JSON.stringify(tenantFeatures)}`);
            } else if (res.status === 404) {
                console.log(`[DOKPLOY DEBUG] Edge Proxy: Backend returned 404 for domain ${tenantSlugToQuery} at ${fetchUrl}`);
                // Redirigir a 404 si el dominio apunta aquí pero no está registrado
                url.pathname = '/404-tenant';
                return NextResponse.rewrite(url);
            } else {
                console.log(`[DOKPLOY DEBUG] Edge Proxy: Backend returned status ${res.status} ${res.statusText} for domain ${tenantSlugToQuery} at ${fetchUrl}`);
            }
        } catch (error: any) {
            console.error(`[DOKPLOY ERROR] Edge Proxy: Falló comunicación con API para el host: ${cleanHostname}. URL: ${fetchUrl}. Error: ${error?.message || error}`);
        }
    }

    const rewritesPaths = [
        '/dashboard/_next',
        '/dashboard/sw.js',
        '/dashboard/sw.js.map',
        '/dashboard/workbox',
        '/dashboard',
        '/admin',
        '/perfil',
        '/cursos',
        '/compras',
        '/kitchen',
        '/suscripcion',
        '/waiter',
        '/whatsapp',
        '/clientes',
        '/driver',
    ];
    const shouldRewrite = rewritesPaths.some(path => url.pathname === path || url.pathname.startsWith(`${path}/`));

    const protectedPaths = [
        ...rewritesPaths,
    ];
    const isProtected = protectedPaths.some(path => url.pathname === path || url.pathname.startsWith(`${path}/`));

    // Bloquear acceso a rutas del SaaS Admin/Panel si el tenant NO tiene el feature activo
    // (Bypass para isBaseDomain, ideal para desarrollo local del dashboard core)
    const hasDashboardFeature = tenantFeatures.some(f => f.toUpperCase() === 'DASHBOARD');
    if (isProtected && !isBaseDomain && !hasDashboardFeature) {
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    // Restringir rutas del menú de restaurante exclusivamente a tenants con RESTAURANT habilitado
    if (url.pathname === '/menu' || url.pathname.startsWith('/menu/')) {
        const hasRestaurantFeature = tenantFeatures.some(f => f.toUpperCase() === 'RESTAURANT' || f.toUpperCase() === 'RESTAURANTE');
        if (!hasRestaurantFeature && !isBaseDomain) {
            console.log(`[DOKPLOY DEBUG] Edge Proxy: Dominio ${cleanHostname} intentó acceder a /menu sin el feature RESTAURANT. Redirigiendo a 404.`);
            url.pathname = '/404-tenant';
            return NextResponse.rewrite(url);
        }
    }

    const requestHeaders = new Headers(request.headers);
    // Inyectar TENANT ID, SLUG y FEATURES dinámico
    requestHeaders.set('x-tenant-id', tenantId);
    requestHeaders.set('x-tenant-slug', tenantSlugToQuery);
    requestHeaders.set('x-tenant-features', JSON.stringify(tenantFeatures));

    if (shouldRewrite) {
        const dashboardHost = process.env.DASHBOARD_INTERNAL_URL || 'http://localhost:3002';
        const destinationTarget = new URL(url.pathname + url.search, dashboardHost);

        requestHeaders.set('x-forwarded-host', request.headers.get('host') || '');
        requestHeaders.set('x-forwarded-proto', request.headers.get('x-forwarded-proto') || url.protocol.replace(':', ''));
        requestHeaders.set('x-forwarded-path', url.pathname);

        return NextResponse.rewrite(destinationTarget, {
            request: { headers: requestHeaders },
        });
    }

    return NextResponse.next({
        request: { headers: requestHeaders },
    });
}

export const config = {
    // Aplicar a casi toda la web, útil para forzar el x-tenant-id incluso en la Landing.
    // IMPORTANTE: Se debe interceptar explícitamente `/dashboard/:path*` para que los assets 
    // del SaaS Dashboard (CSS/JS/SW) no sean ignorados por el proxy por contener puntos.
    matcher: [
        '/dashboard/:path*',
        '/((?!_next/static|_next/image|favicon.ico|images|.*\\..*|api).*)'
    ],
};
