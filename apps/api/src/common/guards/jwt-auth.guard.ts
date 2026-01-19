import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        @Inject(Reflector) private reflector: Reflector,
        private jwtService: JwtService,
        private prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Verificar si la ruta es pública
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Token no proporcionado');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);

            // Cargar usuario desde la base de datos
            const user = await this.prisma.client.user.findUnique({
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
            throw new UnauthorizedException('Token inválido o expirado');
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
