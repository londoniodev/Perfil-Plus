import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();

        // Nivel 1: Confianza Absoluta (JWT Payload)
        // El JwtAuthGuard inyecta los datos de la base de datos validados en request.user
        if (request.user && request.user.tenantId) {
            return request.user.tenantId;
        }

        // Nivel 2: Rutas Públicas (Lectura permitida, ej. Catálogo de productos)
        // Si no hay sesión de usuario, permitimos el fallback del header
        const headerTenantId = request.headers['x-tenant-id'] as string;

        if (!headerTenantId) {
            throw new UnauthorizedException('Tenant ID is missing and the user is not authenticated.');
        }

        return headerTenantId;
    },
);
