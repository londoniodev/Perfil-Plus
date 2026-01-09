import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('accessToken');
    const { pathname } = request.nextUrl;

    // 1. Proteger rutas privadas (/perfil, /cursos)
    const protectedPaths = ['/perfil', '/cursos'];
    const isProtected = protectedPaths.some(path => pathname.startsWith(path));

    if (isProtected && !token) {
        const url = new URL('/admin/login', request.url);
        url.searchParams.set('redirect', pathname);
        // Indicar que la redirección es por falta de sesión
        url.searchParams.set('error', 'session_missing');
        return NextResponse.redirect(url);
    }

    // 2. Redirigir si ya está autenticado e intenta entrar a login/registro
    const authPaths = ['/admin/login', '/registro'];
    const isAuthPage = authPaths.some(path => pathname === path);

    if (isAuthPage && token) {
        return NextResponse.redirect(new URL('/perfil', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/perfil/:path*',
        '/cursos/:path*',
        '/admin/login',
        '/registro'
    ],
};
