import 'reflect-metadata';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';
import { redisStore } from 'cache-manager-redis-yet';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Middleware
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { ClsModule } from 'nestjs-cls';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Core modules
import { PrismaModule } from './prisma';
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { StorageModule } from './modules/storage';
import { BlogModule } from './modules/blog';
import { LmsModule } from './modules/lms';
import { PaymentsModule } from './modules/payments';
import { LeadsModule } from './modules/leads';
import { EmailModule } from './modules/email/email.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { RestaurantModule } from './modules/restaurant/restaurant.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { DeliveryDriversModule } from './modules/delivery-drivers/delivery-drivers.module';

// Guards
import { JwtAuthGuard, RolesGuard } from './common/guards';
import { SettingsModule } from './modules/settings/settings.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TablesModule } from './modules/tables/tables.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { CoreModule } from './modules/core';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsModule } from './modules/metrics';

// Interceptors
// Interceptors removed

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        // Server
        PORT: Joi.number().default(3001),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),

        // Database
        DATABASE_URL: Joi.string().required(),

        // JWT
        JWT_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRES_IN_DAYS: Joi.number().default(7),

        // S3/Minio
        S3_ENDPOINT: Joi.string().required(),
        S3_BUCKET: Joi.string().default('mauro-web'),
        S3_REGION: Joi.string().default('us-east-1'),
        S3_ACCESS_KEY: Joi.string().required(),
        S3_SECRET_KEY: Joi.string().required(),
        S3_PUBLIC_URL: Joi.string().optional(),

        // Mercado Pago
        MP_ACCESS_TOKEN: Joi.string().optional(),
        MP_PUBLIC_KEY: Joi.string().optional(),
        MP_WEBHOOK_SECRET: Joi.string().optional(),

        // Frontend URL (for CORS)
        FRONTEND_URL: Joi.string().default('http://localhost:3000'),

        // SMTP Email
        SMTP_HOST: Joi.string().optional(),
        SMTP_PORT: Joi.number().default(465),
        SMTP_USER: Joi.string().optional(),
        SMTP_PASS: Joi.string().optional().allow(''),
        SMTP_FROM: Joi.string().optional(),

        // Redis
        REDIS_HOST: Joi.string().default('redis'),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().optional().allow(''),

        // CORS & Dokploy Provisioning
        NEXT_PUBLIC_BASE_DOMAIN: Joi.string().optional(),
        DOKPLOY_API_KEY: Joi.string().optional().allow(''),
        DOKPLOY_API_URL: Joi.string().optional(),
        STOREFRONT_DOKPLOY_APP_ID: Joi.string().optional().allow(''),
      }),
    }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req: any) => {
          const tenantId = req.headers['x-tenant-id'] as string;
          if (tenantId) {
            cls.set('tenantId', tenantId);
          }
        },
      },
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),

    // Configuración manual de Prometheus para evitar el bug de Reflect.defineMetadata en .register()
    PrometheusModule,
    
    // Custom metrics endpoint (/metrics) — unifica prom-client + Prisma
    MetricsModule,

    // Core infrastructure (CORS cache, Dokploy)
    CoreModule,

    // Core modules
    PrismaModule,
    AuthModule,
    UsersModule,
    StorageModule,
    ProductsModule,
    OrdersModule,
    BlogModule,
    LmsModule,
    PaymentsModule,
    LeadsModule,
    EmployeesModule,
    InventoryModule,
    DeliveryDriversModule,
    EmailModule,
    RestaurantModule,
    WhatsappModule,

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 300,
      },
      {
        name: 'auth',
        ttl: 60000,
        limit: 10, // Strict limit for login/register
      },
      {
        name: 'public',
        ttl: 60000,
        limit: 300, // Higher limit for public menu browsing
      },
      {
        name: 'strict',
        ttl: 60000,
        limit: 20, // For sensitive operations
      },
    ]),

    // Redis Cache
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get('REDIS_HOST') || 'localhost';
        const port =
          parseInt(configService.get('REDIS_PORT') || '6379') || 6379;
        const hasPassword = !!configService.get('REDIS_PASSWORD');

        console.log(
          `🔌 [CACHE] Intentando conectar a Redis: ${host}:${port} (password: ${hasPassword ? 'sí' : 'no'})`,
        );

        try {
          const store = await redisStore({
            socket: {
              host,
              port,
              connectTimeout: 5000,
            },
            password: configService.get('REDIS_PASSWORD'),
            ttl: 3600 * 1000, // Default TTL: 1 hora en ms
          });
          console.log(
            `✅ [CACHE] Redis cache conectado exitosamente (${host}:${port})`,
          );
          console.log(
            `✅ [CACHE] Backend: REDIS (datos persisten entre restarts)`,
          );
          (global as any).__CACHE_BACKEND__ = 'REDIS';
          return { store };
        } catch (error) {
          console.error(
            `❌ [CACHE] Redis NO disponible (${host}:${port}): ${error.message}`,
          );
          console.warn(
            `⚠️ [CACHE] Backend: IN-MEMORY (¡los datos se pierden con cada restart/deploy!)`,
          );
          (global as any).__CACHE_BACKEND__ = 'IN-MEMORY';
          return { ttl: 3600 * 1000 };
        }
      },
      inject: [ConfigService],
    }),

    // Global JWT configuration (Allows JwtAuthGuard to verify globally)
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRES_IN', '1h'),
        },
      }),
    }),

    // Static Files (for local uploads)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      exclude: ['/api/{*path}'],
    }),

    SettingsModule,

    TenantModule,

    CategoriesModule,

    TablesModule,

    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // Global JWT Auth Guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    // Global Roles Guard
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },

    // Global Rate Limiting Guard
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },

    // Global Prisma Initialization Interceptor
    // REMOVED: Using AsyncLocalStorage Middleware instead
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: PrismaInitInterceptor,
    // },

    // Providers manuales de Prometheus para evitar .register()
    {
      provide: 'PROM_CLIENT_REGISTRY',
      useValue: require('prom-client').register,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
