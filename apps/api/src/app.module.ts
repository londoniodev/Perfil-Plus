import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Core modules
import { PrismaModule } from './prisma';
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { StorageModule } from './modules/storage';
import { BlogModule } from './modules/blog';
import { LmsModule } from './modules/lms';
import { PaymentsModule } from './modules/payments';
import { EbooksModule } from './modules/ebooks';
import { LeadsModule } from './modules/leads';
import { EmailModule } from './modules/email/email.module';

// Guards
import { JwtAuthGuard, RolesGuard } from './common/guards';

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
        DATABASE_URL_BASE: Joi.string().required(),

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
        SMTP_PASS: Joi.string().optional(),
        SMTP_FROM: Joi.string().optional(),
      }),
    }),

    // Core modules
    PrismaModule,
    AuthModule,
    UsersModule,
    StorageModule,
    BlogModule,
    LmsModule,
    PaymentsModule,
    EbooksModule,
    LeadsModule,
    EmailModule,

    // Rate Limiting - 20 requests per minute globally
    ThrottlerModule.forRoot([{
      ttl: 60000,    // 1 minuto en milisegundos
      limit: 20,     // 20 requests por minuto (global)
    }]),
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
  ],
})
export class AppModule { }
