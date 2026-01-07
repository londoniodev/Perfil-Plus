import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Core modules
import { PrismaModule } from './prisma';
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { StorageModule } from './modules/storage';

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
      }),
    }),

    // Core modules
    PrismaModule,
    AuthModule,
    UsersModule,
    StorageModule,
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
  ],
})
export class AppModule { }
