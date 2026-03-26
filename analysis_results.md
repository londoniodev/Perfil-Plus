
# Analisis de Nomenclatura (snake_case y kebab-case)

## Resumen
- **snake_case**: 681 ocurrencias (común en APIs externas y DBs).
- **kebab-case** (fuera de clases CSS): 5833 ocurrencias (puede ser en configuraciones o IDs de URLs).

## Ejemplos de snake_case
- **apps\api\src\common\guards\custom-throttler.guard.ts:25**: `default_dev_secret_key`
  `process.env.INTERNAL_API_KEY || 'default_dev_secret_key';`
- **apps\api\src\modules\categories\categories.service.ts:37**: `menu_context`
  ``tenant:${tenantId}:menu_context`,`
- **apps\api\src\modules\categories\categories.service.ts:38**: `product_catalog`
  ``tenant:${tenantId}:product_catalog`,`
- **apps\api\src\modules\core\cors-cache.service.ts:11**: `cors_allowed_origins`
  `private readonly REDIS_KEY = 'cors_allowed_origins';`
- **apps\api\src\modules\employees\employees.service.spec.ts:13**: `hashed_password_123`
  `hash: jest.fn().mockResolvedValue('hashed_password_123'),`
- **apps\api\src\modules\employees\employees.service.spec.ts:81**: `hashed_password_123`
  `password: 'hashed_password_123',`
- **apps\api\src\modules\inventory\inventory.service.ts:527**: `total_stock`
  `total_stock: number;`
- **apps\api\src\modules\inventory\inventory.service.ts:528**: `min_stock`
  `min_stock: number;`
- **apps\api\src\modules\inventory\inventory.service.ts:531**: `total_stock`
  `COALESCE(SUM(ws."currentStock"), 0)::float AS total_stock,`
- **apps\api\src\modules\inventory\inventory.service.ts:532**: `min_stock`
  `ii."minStock"::float AS min_stock`
- **apps\api\src\modules\inventory\inventory.service.ts:545**: `total_stock`
  `currentStock: r.total_stock,`
- **apps\api\src\modules\inventory\inventory.service.ts:546**: `min_stock`
  `minStock: r.min_stock,`
- **apps\api\src\modules\inventory\inventory.service.ts:749**: `avg_margin`
  `this.prisma.$queryRaw<[{ avg_margin: number | null }]>``
- **apps\api\src\modules\inventory\inventory.service.ts:750**: `product_margins`
  `WITH product_margins AS (`
- **apps\api\src\modules\inventory\inventory.service.ts:764**: `avg_margin`
  `SELECT AVG(margin)::float AS "avg_margin"`
- **apps\api\src\modules\inventory\inventory.service.ts:765**: `product_margins`
  `FROM product_margins`
- **apps\api\src\modules\inventory\inventory.service.ts:794**: `avg_margin`
  `avgMargin: avgMargin[0]?.avg_margin ?? 0,`
- **apps\api\src\modules\orders\listeners\delivery-assignment.listener.ts:18**: `status_changed`
  `@OnEvent('order.status_changed', { async: true })`
- **apps\api\src\modules\orders\listeners\order-analytics.listener.ts:51**: `status_changed`
  `@OnEvent('order.status_changed', { async: true })`
- **apps\api\src\modules\orders\listeners\order-sse.listener.ts:20**: `new_order`
  `type: 'new_order',`
- **apps\api\src\modules\orders\listeners\order-sse.listener.ts:35**: `status_changed`
  `@OnEvent('order.status_changed', { async: true })`
- **apps\api\src\modules\orders\listeners\order-sse.listener.ts:39**: `status_changed`
  `type: 'status_changed',`
- **apps\api\src\modules\orders\listeners\whatsapp-notification.listener.ts:33**: `status_changed`
  `@OnEvent('order.status_changed', { async: true })`
- **apps\api\src\modules\orders\orders.gateway.spec.ts:16**: `new_order`
  `it('debería emitir evento new_order a los suscriptores', (done) => {`
- **apps\api\src\modules\orders\orders.gateway.spec.ts:19**: `new_order`
  `type: 'new_order',`
- **apps\api\src\modules\orders\orders.gateway.spec.ts:40**: `status_changed`
  `it('debería emitir evento status_changed', (done) => {`
- **apps\api\src\modules\orders\orders.gateway.spec.ts:43**: `status_changed`
  `type: 'status_changed',`
- **apps\api\src\modules\orders\orders.gateway.spec.ts:52**: `status_changed`
  `expect(message.data.type).toBe('status_changed');`
- **apps\api\src\modules\orders\orders.gateway.spec.ts:60**: `payment_received`
  `it('debería emitir evento payment_received', (done) => {`
- **apps\api\src\modules\orders\orders.gateway.spec.ts:63**: `payment_received`
  `type: 'payment_received',`
- **apps\api\src\modules\orders\orders.gateway.spec.ts:72**: `payment_received`
  `expect(message.data.type).toBe('payment_received');`
- **apps\api\src\modules\orders\orders.gateway.spec.ts:85**: `new_order`
  `type: 'new_order',`
- **apps\api\src\modules\orders\orders.gateway.spec.ts:105**: `new_order`
  `{ type: 'new_order', orderId: 'order-1', data: { seq: 1 } },`
- **apps\api\src\modules\orders\orders.gateway.spec.ts:106**: `status_changed`
  `{ type: 'status_changed', orderId: 'order-1', data: { seq: 2 } },`
- **apps\api\src\modules\orders\orders.gateway.spec.ts:107**: `payment_received`
  `{ type: 'payment_received', orderId: 'order-1', data: { seq: 3 } },`
- **apps\api\src\modules\orders\orders.gateway.spec.ts:115**: `new_order`
  `expect(messages[0].data.type).toBe('new_order');`
- **apps\api\src\modules\orders\orders.gateway.spec.ts:116**: `status_changed`
  `expect(messages[1].data.type).toBe('status_changed');`
- **apps\api\src\modules\orders\orders.gateway.spec.ts:117**: `payment_received`
  `expect(messages[2].data.type).toBe('payment_received');`
- **apps\api\src\modules\orders\orders.gateway.ts:18**: `new_order`
  `type: 'new_order' | 'status_changed' | 'payment_received' | 'driver_assigned';`
- **apps\api\src\modules\orders\orders.gateway.ts:18**: `status_changed`
  `type: 'new_order' | 'status_changed' | 'payment_received' | 'driver_assigned';`
- **apps\api\src\modules\orders\orders.gateway.ts:18**: `payment_received`
  `type: 'new_order' | 'status_changed' | 'payment_received' | 'driver_assigned';`
- **apps\api\src\modules\orders\orders.gateway.ts:18**: `driver_assigned`
  `type: 'new_order' | 'status_changed' | 'payment_received' | 'driver_assigned';`
- **apps\api\src\modules\orders\orders.service.spec.ts:985**: `payment_received`
  `type: 'payment_received',`
- **apps\api\src\modules\orders\orders.service.spec.ts:1210**: `new_order`
  `it('debería emitir evento new_order al crear orden', async () => {`
- **apps\api\src\modules\orders\orders.service.spec.ts:1234**: `status_changed`
  `it('debería emitir evento status_changed al actualizar estado', async () => {`
- **apps\api\src\modules\orders\orders.service.spec.ts:1251**: `status_changed`
  `type: 'status_changed',`
- **apps\api\src\modules\orders\orders.service.spec.ts:1257**: `payment_received`
  `it('debería emitir evento payment_received al crear pago', async () => {`
- **apps\api\src\modules\orders\orders.service.spec.ts:1275**: `payment_received`
  `type: 'payment_received',`
- **apps\api\src\modules\orders\orders.service.ts:360**: `status_changed`
  `type: 'status_changed',`
- **apps\api\src\modules\orders\orders.service.ts:636**: `payment_received`
  `type: 'payment_received',`

## Ejemplos de kebab-case (Posibles variables o JSON keys)
- **apps\api\scripts\sync-legacy-s3.ts:8**: `sync-legacy-s3`
  `* Ejecución: npx tsx scripts/sync-legacy-s3.ts`
- **apps\api\scripts\sync-legacy-s3.ts:11**: `aws-sdk`
  `import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';`
- **apps\api\scripts\sync-legacy-s3.ts:11**: `client-s3`
  `import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';`
- **apps\api\scripts\sync-legacy-s3.ts:15**: `xn--alvarolondoo-khb`
  `const S3_ENDPOINT = 'https://s3.xn--alvarolondoo-khb.dev';`
- **apps\api\scripts\sync-legacy-s3.ts:16**: `us-east-1`
  `const S3_REGION = 'us-east-1';`
- **apps\api\scripts\sync-legacy-s3.ts:25**: `a-z0-9`
  `return slug.toLowerCase().replace(/[^a-z0-9-]/g, '');`
- **apps\api\scripts\upload-products.ts:4**: `aws-sdk`
  `import { S3Client, PutObjectCommand, HeadBucketCommand, CreateBucketCommand, PutBucketPolicyCommand `
- **apps\api\scripts\upload-products.ts:4**: `client-s3`
  `import { S3Client, PutObjectCommand, HeadBucketCommand, CreateBucketCommand, PutBucketPolicyCommand `
- **apps\api\scripts\upload-products.ts:12**: `web-projects`
  `const DB_URL = 'postgresql://postgres:alvarojose1998@72.62.161.199:5432/web-projects';`
- **apps\api\scripts\upload-products.ts:16**: `xn--alvarolondoo-khb`
  `endpoint: 'https://s3.xn--alvarolondoo-khb.dev',`
- **apps\api\scripts\upload-products.ts:17**: `us-east-1`
  `region: 'us-east-1',`
- **apps\api\scripts\upload-products.ts:20**: `xn--alvarolondoo-khb`
  `publicUrl: 'https://s3.xn--alvarolondoo-khb.dev',`
- **apps\api\scripts\upload-products.ts:100**: `a-z0-9`
  `const slug = item.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');`
- **apps\api\src\app.module.ts:6**: `cache-manager`
  `import { CacheModule } from '@nestjs/cache-manager';`
- **apps\api\src\app.module.ts:8**: `custom-throttler`
  `import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';`
- **apps\api\src\app.module.ts:9**: `cache-manager-redis-yet`
  `import { redisStore } from 'cache-manager-redis-yet';`
- **apps\api\src\app.module.ts:13**: `serve-static`
  `import { ServeStaticModule } from '@nestjs/serve-static';`
- **apps\api\src\app.module.ts:18**: `nestjs-cls`
  `import { ClsModule } from 'nestjs-cls';`
- **apps\api\src\app.module.ts:19**: `event-emitter`
  `import { EventEmitterModule } from '@nestjs/event-emitter';`
- **apps\api\src\app.module.ts:36**: `delivery-drivers`
  `import { DeliveryDriversModule } from './modules/delivery-drivers/delivery-drivers.module';`
- **apps\api\src\app.module.ts:36**: `delivery-drivers`
  `import { DeliveryDriversModule } from './modules/delivery-drivers/delivery-drivers.module';`
- **apps\api\src\app.module.ts:72**: `mauro-web`
  `S3_BUCKET: Joi.string().default('mauro-web'),`
- **apps\api\src\app.module.ts:73**: `us-east-1`
  `S3_REGION: Joi.string().default('us-east-1'),`
- **apps\api\src\app.module.ts:110**: `x-tenant-id`
  `const tenantId = req.headers['x-tenant-id'] as string;`
- **apps\api\src\common\decorators\current-tenant.decorator.ts:19**: `x-tenant-id`
  `const headerTenantId = request.headers['x-tenant-id'] as string;`
- **apps\api\src\common\decorators\index.ts:3**: `current-user`
  `export * from './current-user.decorator';`
- **apps\api\src\common\decorators\index.ts:4**: `current-tenant`
  `export * from './current-tenant.decorator';`
- **apps\api\src\common\guards\custom-throttler.guard.ts:22**: `x-internal-token`
  `request.headers['x-internal-token'] ||`
- **apps\api\src\common\guards\custom-throttler.guard.ts:23**: `x-revalidate-secret`
  `request.headers['x-revalidate-secret'];`
- **apps\api\src\common\guards\index.ts:1**: `jwt-auth`
  `export * from './jwt-auth.guard';`
- **apps\api\src\common\guards\jwt-auth.guard.ts:12**: `nestjs-cls`
  `import { ClsService } from 'nestjs-cls';`
- **apps\api\src\common\guards\jwt-auth.guard.ts:49**: `multi-tenant`
  `// Inyectar contexto multi-tenant de manera segura ANTES de hacer peticiones a Prisma.`
- **apps\api\src\common\middleware\tenant.middleware.ts:3**: `tenant-request`
  `import { TenantRequest } from '../interfaces/tenant-request.interface';`
- **apps\api\src\common\middleware\tenant.middleware.ts:10**: `x-tenant-id`
  `const tenantId = req.headers['x-tenant-id'] as string;`
- **apps\api\src\main.ts:5**: `cors-cache`
  `import { CorsCacheService } from './modules/core/cors-cache.service';`
- **apps\api\src\main.ts:6**: `cookie-parser`
  `import cookieParser from 'cookie-parser';`
- **apps\api\src\main.ts:18**: `cross-origin`
  `crossOriginResourcePolicy: { policy: 'cross-origin' }, // Permite cargar recursos desde otros domini`
- **apps\api\src\main.ts:58**: `multi-tenant`
  `// Base domains for multi-tenant (Dynamic from env)`
- **apps\api\src\main.ts:84**: `server-side`
  `// Allow server-side requests (no origin) and Postman`
- **apps\api\src\main.ts:110**: `x-tenant-id`
  `'x-tenant-id',`
- **apps\api\src\main.ts:111**: `x-internal-token`
  `'x-internal-token',`
- **apps\api\src\modules\analytics\analytics.controller.ts:3**: `current-tenant`
  `import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';`
- **apps\api\src\modules\analytics\analytics.controller.ts:4**: `jwt-auth`
  `import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';`
- **apps\api\src\modules\analytics\analytics.controller.ts:20**: `z-report`
  `@Get('z-report')`
- **apps\api\src\modules\analytics\analytics.service.ts:3**: `nestjs-cls`
  `import { ClsService } from 'nestjs-cls';`
- **apps\api\src\modules\analytics\analytics.service.ts:96**: `eslint-disable`
  `/* eslint-disable no-restricted-syntax */`
- **apps\api\src\modules\analytics\analytics.service.ts:96**: `no-restricted-syntax`
  `/* eslint-disable no-restricted-syntax */`
- **apps\api\src\modules\analytics\analytics.service.ts:109**: `eslint-enable`
  `/* eslint-enable no-restricted-syntax */`
- **apps\api\src\modules\analytics\analytics.service.ts:109**: `no-restricted-syntax`
  `/* eslint-enable no-restricted-syntax */`
- **apps\api\src\modules\analytics\analytics.service.ts:223**: `multi-table`
  `// Production times by product — multi-table JOIN inalcanzable con Prisma ORM`

---
**Conclusión inicial**: Hay 681 variables/propiedades en `snake_case` que deberían ser transformadas en las interfaces/DTOs a `camelCase`.
