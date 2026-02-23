import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { TenantRequest } from '../interfaces/tenant-request.interface';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    private readonly logger = new Logger(TenantMiddleware.name);

    use(req: TenantRequest, res: Response, next: NextFunction) {
        const tenantId = req.headers['x-tenant-id'] as string;

        if (tenantId) {
            req.tenantId = tenantId;
        }

        next();
    }
}
