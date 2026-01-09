import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Rutas protegidas
    const protectedPaths = ['/perfil', '/cursos'];
    const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

    if (isProtected) {
        const token = request.cookies.get('accessToken');

        if (!token) {
            // Guardar la URL original para redirigir después del login
            const url = new URL('/admin/login', request.url);
            url.searchParams.set('redirect', request.nextUrl.pathname);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/perfil/:path*', '/cursos/:path*'],
};
