import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { ModuleRef, ContextIdFactory } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Interceptor que inicializa el cliente Prisma antes de ejecutar la ruta.
 * Utiliza ModuleRef para resolver el servicio request-scoped dinámicamente,
 * evitando problemas de instanciación con interceptores globales.
 */
@Injectable()
export class PrismaInitInterceptor implements NestInterceptor {
    constructor(private moduleRef: ModuleRef) { }

    async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();

        // Solo inicializar si tiene header x-tenant-id
        const tenantId = request.headers['x-tenant-id'];
        if (tenantId) {
            // Resolver PrismaService para el contexto actual (Request Scope)
            // Usamos { strict: false } para buscar en el contexto global ya que PrismaModule es Global
            const contextId = ContextIdFactory.getByRequest(request);
            const prisma = await this.moduleRef.resolve(PrismaService, contextId, { strict: false });

            await prisma.initClient();
        }

        return next.handle();
    }
}
