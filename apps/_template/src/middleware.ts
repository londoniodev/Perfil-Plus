import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================================
// TENANT RESOLUTION MIDDLEWARE
// ============================================================================
// Detects tenant from subdomain and injects x-tenant-id header for downstream use.
// Falls back to NEXT_PUBLIC_TENANT_ID for local development without subdomains.
// ============================================================================

// Domains that should NOT be treated as tenant subdomains
const RESERVED_SUBDOMAINS = ['www', 'api', 'admin', 'platform', 'app'];

// Main domains (requests to these go to marketing, not tenant resolution)
const MAIN_DOMAINS = [
    'localhost',
    '127.0.0.1',
    'tudominio.com',      // Replace with your actual main domain
    'vercel.app',         // For preview deployments
];

/**
 * Extract subdomain from hostname
 * Examples:
 *   mauro.tudominio.com -> 'mauro'
 *   www.tudominio.com -> null (reserved)
 *   tudominio.com -> null (main domain)
 *   localhost:3000 -> null (local dev)
 */
function extractSubdomain(hostname: string): string | null {
    // Remove port if present
    const host = hostname.split(':')[0];

    // Check if it's a main domain (no subdomain)
    if (MAIN_DOMAINS.some(domain => host === domain || host.endsWith(`.${domain}`))) {
        const parts = host.split('.');

        // For localhost or IP, no subdomain
        if (parts.length <= 1 || host === 'localhost') {
            return null;
        }

        // For domains like mauro.vercel.app or mauro.tudominio.com
        // The subdomain is the first part
        const subdomain = parts[0];

        // Skip reserved subdomains
        if (RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())) {
            return null;
        }

        return subdomain;
    }

    // For custom domains like mauro.tudominio.com
    const parts = host.split('.');
    if (parts.length >= 3) {
        const subdomain = parts[0];
        if (!RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())) {
            return subdomain;
        }
    }

    return null;
}

/**
 * Get tenant ID from subdomain or fallback to environment variable
 */
function resolveTenantId(request: NextRequest): string {
    const hostname = request.headers.get('host') || '';
    const subdomain = extractSubdomain(hostname);

    // If subdomain detected, use it as tenant ID
    if (subdomain) {
        return subdomain;
    }

    // Fallback to environment variable (for local development)
    return process.env.NEXT_PUBLIC_TENANT_ID?.trim() || 'default';
}

// ============================================================================
// MIDDLEWARE HANDLER
// ============================================================================

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Resolve Tenant ID
    const tenantId = resolveTenantId(request);

    // 2. Inject tenant ID into request headers for Server Components
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

    // 5. App-like behavior: Root redirects to dashboard if authenticated
    if (pathname === '/' && token) {
        return NextResponse.redirect(new URL('/perfil', request.url));
    }

    // 6. Continue with injected tenant header
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
