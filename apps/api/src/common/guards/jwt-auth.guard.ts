import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private jwtService: JwtService,
        private prisma: PrismaService, // Inject directly (Singleton)
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Verificar si la ruta es pública
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (isPublic && !token) {
            return true;
        }

        // Si es público pero HAY token, intentamos procesarlo (Optional Auth)
        // Si falla (expirado, inválido), simplemente lo ignoramos si es público.
        // Si no es público, el error se lanzará más abajo.

        if (!token) {
            throw new UnauthorizedException('Token no proporcionado');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);

            // Cargar usuario desde la base de datos
            // PrismaService.client getter will throw if no tenant context, BUT:
            // This guard runs AFTER middleware, so context should be there IF x-tenant-id was sent.
            // If x-tenant-id is missing, this might fail unless we handle it.
            // But JwtAuth usually implies we are in a tenant context or global?
            // If global (e.g. /profile), we might need a different DB strategy or master DB.
            // Assuming for now Auth is tenant-scoped as per previous analysis.

            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    subscription: {
                        select: {
                            status: true,
                            endDate: true,
                        },
                    },
                },
            });

            if (!user) {
                throw new UnauthorizedException('Usuario no encontrado');
            }

            // Añadir usuario al request
            request.user = {
                ...user,
                hasActiveSubscription:
                    user.subscription?.status === 'ACTIVE' &&
                    (!user.subscription?.endDate || new Date(user.subscription.endDate) > new Date()),
            };
        } catch (error) {
            const isExpired = error.name === 'TokenExpiredError' ||
                (error.message && error.message.toLowerCase().includes('expired'));

            if (isExpired) {
                // Log expirations as warn/debug since it's expected behavior for client to refresh
                console.warn('[JwtAuthGuard]: Token expired');
            } else {
                console.error('[JwtAuthGuard Error]:', error); // Other errors remain as errors
            }

            if (isPublic) {
                return true;
            }

            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException(`Token inválido o expirado: ${(error as any).message}`);
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        // 1. Intentar leer de cookie
        if (request.cookies && request.cookies.accessToken) {
            return request.cookies.accessToken;
        }

        // 2. Intentar leer de header Authorization
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}

