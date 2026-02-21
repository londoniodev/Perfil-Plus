import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaContext } from '../../prisma/prisma-context.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    private readonly logger = new Logger(TenantMiddleware.name);

    constructor(
        private readonly prismaContext: PrismaContext,
        private readonly prismaService: PrismaService,
    ) { }

    use(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.headers['x-tenant-id'] as string;

        // AsyncLocalStorage.run() maintains context across async boundaries.
        // We resolve the PrismaClient BEFORE calling next() so downstream
        // handlers can access it synchronously via PrismaService.client.
        this.prismaContext.run(async () => {
            if (tenantId) {
                this.prismaContext.setTenantId(tenantId);
                try {
                    const client = await this.prismaService.getTenantClient(tenantId);
                    this.prismaContext.set('prismaClient', client);
                } catch (error) {
                    this.logger.error(`Failed to resolve tenant "${tenantId}": ${error}`);
                }
            }
            next();
        });
    }
}
