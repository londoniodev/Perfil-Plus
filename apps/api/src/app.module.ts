import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Middleware
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { ClsModule } from 'nestjs-cls';

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

// Guards
import { JwtAuthGuard, RolesGuard } from './common/guards';
import { SettingsModule } from './modules/settings/settings.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TablesModule } from './modules/tables/tables.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

// Interceptors
// Interceptors removed

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        // Server
        PORT: Joi.number().default(3001),
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

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
      }),
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),

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
    EmailModule,
    RestaurantModule,

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
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
      }
    ]),

    // Redis Cache
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        try {
          const store = await redisStore({
            socket: {
              host: configService.get('REDIS_HOST') || 'localhost',
              port: parseInt(configService.get('REDIS_PORT') || '6379') || 6379,
              connectTimeout: 3000,
            },
            password: configService.get('REDIS_PASSWORD'),
            ttl: 3600 * 1000,
          });
          console.log('✅ Redis cache connected');
          return { store };
        } catch (error) {
          console.warn('⚠️ Redis not available, using in-memory cache:', error.message);
          return { ttl: 3600 * 1000 };
        }
      },
      inject: [ConfigService],
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
      useClass: ThrottlerGuard,
    },

    // Global Prisma Initialization Interceptor
    // REMOVED: Using AsyncLocalStorage Middleware instead
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: PrismaInitInterceptor,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*');
  }
}

