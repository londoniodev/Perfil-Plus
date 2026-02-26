import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    public readonly secure: ReturnType<typeof this.createExtendedClient>;

    constructor(private readonly cls: ClsService) {
        super({
            log: process.env.NODE_ENV === 'development'
                ? ['error', 'warn']
                : ['error'],
        });
        this.secure = this.createExtendedClient();
    }

    async onModuleInit() {
        await this.$connect();
        this.logger.log('Connected to database (Single-Database Multi-Tenant)');
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Disconnected from database');
    }

    private createExtendedClient() {
        return this.$extends({
            query: {
                $allModels: {
                    async $allOperations({ model, operation, args, query }) {
                        const globalModels = [
                            'User',
                            'EmailVerificationToken',
                            'RefreshToken',
                            'PasswordResetToken',
                            'PlatformUser',
                            'SystemSettings'
                        ];

                        if (globalModels.includes(model)) {
                            return query(args);
                        }

                        const safeTenantId = this.cls.get('tenantId');

                        if (safeTenantId) {
                            if (['findMany', 'findFirst', 'findUnique', 'findUniqueOrThrow', 'count', 'update', 'updateMany', 'delete', 'deleteMany', 'aggregate', 'groupBy'].includes(operation)) {
                                args.where = { ...args.where, tenantId: safeTenantId };
                            }

                            if (['create', 'createMany'].includes(operation)) {
                                // @ts-ignore
                                args.data = { ...args.data, tenantId: safeTenantId };
                            }
                        }

                        return query(args);
                    },
                },
            },
        });
    }
}
