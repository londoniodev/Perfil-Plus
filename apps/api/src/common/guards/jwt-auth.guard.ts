import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private prisma: PrismaService, // Inject directly (Singleton)
    private cls: ClsService,
  ) {}

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

      if (payload.tenantId) {
        // Inyectar contexto multi-tenant de manera segura ANTES de hacer peticiones a Prisma.
        this.cls.set('tenantId', payload.tenantId);
      }
      
      // Inyectar rol y userId para lógica de bypass en PrismaExtension
      this.cls.set('role', payload.role);
      this.cls.set('userId', payload.sub);

      // ✅ Zero-Trust Optimization: No consultamos la DB para el contexto básico.
      // Extraemos tenantId, role y sub (userId) directamente del JWT.
      const hasActiveSubscription =
        payload.subscriptionStatus === 'ACTIVE' &&
        (!payload.subscriptionEndDate ||
          new Date(payload.subscriptionEndDate) > new Date());

      // Añadir usuario al request desde el payload del JWT
      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        name: payload.name,
        tenantId: payload.tenantId,
        hasActiveSubscription,
      };
    } catch (error) {
      const isExpired =
        error.name === 'TokenExpiredError' ||
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
      throw new UnauthorizedException(
        `Token inválido o expirado: ${error.message}`,
      );
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
