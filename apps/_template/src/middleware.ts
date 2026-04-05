import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const _rawInternalUrl = (process.env.INTERNAL_API_URL || 'http://localhost:3001/api').replace(/\/+$/, "");
const INTERNAL_API_URL = _rawInternalUrl.endsWith('/api') ? _rawInternalUrl : `${_rawInternalUrl}/api`;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'default_dev_secret_key';

export async function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();

    // Leer el Host considerando que estamos detrás de un Reverse Proxy (Dokploy/Traefik)
    const hostname = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
    const cleanHostname = hostname.split(':')[0];
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[DOKPLOY DEBUG] Raw Hostname: ${hostname} | Clean: ${cleanHostname}`);
    }

    let domainToQuery = cleanHostname;
    if (domainToQuery.startsWith('www.')) {
        domainToQuery = domainToQuery.substring(4);
    }

    // NOTA: La ruta /meta/conectar ahora se sirve de forma nativa desde _template.
    // Ya no se requiere un bypass/rewrite hacia saas_dashboard.


    const baseDomainEnv = process.env.BASE_DOMAIN || 'perfil.plus';
    const techProviderEnv = process.env.TECH_PROVIDER_DOMAIN || 'xn--alvarolondoo-khb.dev';
    const techProviderSlug = techProviderEnv.split('.')[0];
    
    // Si el dominio es localhost, el dominio base, o el tech provider, no intentamos resolver un tenant
    const isBaseDomain = ['localhost', '127.0.0.1', baseDomainEnv, techProviderEnv].some(d => 
        domainToQuery === d || domainToQuery.includes('localhost') || domainToQuery.includes('127.0.0.1')
    );

    let tenantId = process.env.NEXT_PUBLIC_TENANT_ID || 'default_tenant';
    let tenantSlug = process.env.NEXT_PUBLIC_TENANT_ID || domainToQuery; // Fallback al dominio

    // Forzar tenantId correcto si estamos en el dominio del Tech Provider (SaaS Owner)
    if (domainToQuery === techProviderEnv || domainToQuery === 'alvarolondoño.dev' || domainToQuery === 'xn--alvarolondoo-khb.dev') {
        tenantId = techProviderSlug;
        tenantSlug = techProviderSlug;
    }
    let tenantFeatures: string[] = [];
    let tenantCustomLinks: { label: string; href: string }[] = [];

    if (!isBaseDomain) {
        // Validación Fail-fast: INTERNAL_API_URL es obligatorio en producción
        if (!process.env.INTERNAL_API_URL && process.env.NODE_ENV === 'production') {
            console.error("[DOKPLOY ERROR] INTERNAL_API_URL is not defined. Edge Proxy cannot identify tenant.");
            url.pathname = '/500-internal-error'; // Opcional: ruta de error crítico
            return NextResponse.rewrite(url);
        }

        const fetchUrl = `${INTERNAL_API_URL}/tenant/identify?domain=${domainToQuery}`;
        try {
            // Petición al backend en Docker para resolver host
            // Usamos caché ISR (Edge) atada a un tag único por dominio.
            // Pasa el TTFB de ~250ms a ~15ms.
            const res = await fetch(fetchUrl, {
                next: { 
                    revalidate: 3600, // 1 hora de caché por defecto
                    tags: [`tenant-resolve-${domainToQuery}`] 
                },
                headers: {
                    'x-internal-token': INTERNAL_API_KEY
                }
            });

            if (res.ok) {
                const tenantData = await res.json();
                tenantId = tenantData.id;
                tenantSlug = tenantData.slug || domainToQuery;
                tenantFeatures = (tenantData.features || []).map((f: string) => f.toUpperCase());
                tenantCustomLinks = tenantData.customLinks || [];
                if (process.env.NODE_ENV !== 'production') {
                    console.log(`[DOKPLOY DEBUG] Edge Proxy Success: Tenant ID identified as ${tenantId}, slug: ${tenantSlug}, features: ${JSON.stringify(tenantFeatures)}`);
                }
            } else if (res.status === 404) {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(`[DOKPLOY DEBUG] Edge Proxy: Backend returned 404 for domain ${domainToQuery} at ${fetchUrl}`);
                }
                // Redirigir a 404 si el dominio apunta aquí pero no está registrado
                url.pathname = '/404-tenant';
                return NextResponse.rewrite(url);
            } else {
                // SIEMPRE logear errores inesperados (incluso en producción)
                console.error(`[DOKPLOY ERROR] Edge Proxy: Backend returned status ${res.status} ${res.statusText} for domain ${domainToQuery} at ${fetchUrl}`);
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

    // ── Protección de rutas públicas por feature ──
    const featureRouteGuards: { path: string; feature: string }[] = [
        { path: '/menu', feature: 'RESTAURANT' },
        { path: '/tienda', feature: 'SHOP' },
        { path: '/blog', feature: 'BLOG' },
        { path: '/formacion', feature: 'LMS' },
    ];

    // Normalización defensiva de Features (ECOMMERCE -> SHOP)
    const normalizedFeatures = tenantFeatures.map(f => {
        const up = f.toUpperCase();
        if (up === 'ECOMMERCE') return 'SHOP';
        return up;
    });

    for (const guard of featureRouteGuards) {
        if (url.pathname === guard.path || url.pathname.startsWith(`${guard.path}/`)) {
            const hasFeature = normalizedFeatures.includes(guard.feature);
            if (!hasFeature && !isBaseDomain) {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(`[DOKPLOY DEBUG] Edge Proxy: Dominio ${cleanHostname} intentó acceder a ${guard.path} sin el feature ${guard.feature}. Redirigiendo a 404.`);
                }
                url.pathname = '/404-tenant';
                return NextResponse.rewrite(url);
            }
        }
    }

    const requestHeaders = new Headers(request.headers);
    // Inyectar TENANT ID, SLUG y FEATURES dinámico
    requestHeaders.set('x-tenant-id', tenantId);
    requestHeaders.set('x-tenant-slug', tenantSlug);
    requestHeaders.set('x-tenant-features', JSON.stringify(normalizedFeatures));
    requestHeaders.set('x-tenant-custom-links', JSON.stringify(tenantCustomLinks));
    requestHeaders.set('x-is-home', (url.pathname === '/' || url.pathname === '/home') ? 'true' : 'false');

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
