import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaContext implements OnModuleDestroy {
    private readonly als = new AsyncLocalStorage<Map<string, any>>();

    constructor() { }

    run<R>(fn: () => R): R {
        return this.als.run(new Map(), fn);
    }

    set<T>(key: string, value: T): void {
        const store = this.als.getStore();
        if (store) {
            store.set(key, value);
        }
    }

    get<T>(key: string): T | undefined {
        const store = this.als.getStore();
        return store?.get(key);
    }

    onModuleDestroy() {
        this.als.disable();
    }

    // Typed helpers
    setTenantId(tenantId: string) {
        this.set('tenantId', tenantId);
    }

    getTenantId(): string | undefined {
        return this.get<string>('tenantId');
    }
}
