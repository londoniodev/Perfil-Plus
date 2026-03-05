import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (!user.hasActiveSubscription) {
      throw new ForbiddenException(
        'Se requiere una suscripción activa para acceder a este contenido',
      );
    }

    return true;
  }
}
