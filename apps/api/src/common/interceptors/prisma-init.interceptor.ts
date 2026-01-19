import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Interceptor que inicializa el cliente Prisma antes de ejecutar la ruta.
 * Esto asegura que la consulta al tenant se haga ANTES de que los servicios
 * intenten acceder al cliente Prisma.
 */
@Injectable()
export class PrismaInitInterceptor implements NestInterceptor {
    constructor(private readonly prisma: PrismaService) { }

    async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();

        // Solo inicializar si tiene header x-tenant-id y no es una ruta pública
        const tenantId = request.headers['x-tenant-id'];
        if (tenantId) {
            await this.prisma.initClient();
        }

        return next.handle();
    }
}
