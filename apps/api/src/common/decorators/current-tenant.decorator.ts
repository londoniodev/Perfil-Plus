import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();
        const tenantId = request.tenantId;
        if (!tenantId) {
            throw new BadRequestException('Tenant ID is required (x-tenant-id header missing)');
        }
        return tenantId;
    },
);
