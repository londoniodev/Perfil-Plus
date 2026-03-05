import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Helmet - Headers de seguridad adicionales
  app.use(
    helmet({
      contentSecurityPolicy: false, // Manejado por Next.js frontend
      crossOriginEmbedderPolicy: false, // Permitir embeds (videos, iframes)
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Permite cargar recursos desde otros dominios
    }),
  );

  app.use(cookieParser());

  // Confiar en el proxy inverso (Nginx/Traefik/etc)
  // Esto asegura que req.hostname y req.ip sean correctos
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  const configService = app.get(ConfigService);
  const isProduction = configService.get('NODE_ENV') === 'production';

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration - Multi-tenant DYNAMIC
  // Automatically allows any subdomain of the base domains (*.alvarolondoño.dev, *.alvarolondoño.com)
  // Plus any additional origins from CORS_ORIGINS env var
  const corsOriginsEnv = configService.get<string>('CORS_ORIGINS', '');
  const corsOriginsList = corsOriginsEnv
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  // Base domains for multi-tenant (IDN-encoded versions of alvarolondoño)
  const allowedBaseDomains = [
    '.xn--alvarolondoo-khb.dev', // *.alvarolondoño.dev
    '.xn--alvarolondoo-khb.com', // *.alvarolondoño.com
  ];

  // In development, always allow localhost
  const devOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3003',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3003',
  ];
  const explicitOrigins = isProduction
    ? corsOriginsList
    : [...corsOriginsList, ...devOrigins];

  logger.log(
    `CORS: Explicit origins (${explicitOrigins.length}): ${explicitOrigins.join(', ') || 'none'}`,
  );
  logger.log(`CORS: Dynamic base domains: ${allowedBaseDomains.join(', ')}`);

  app.enableCors({
    origin: (requestOrigin, callback) => {
      // Allow server-side requests (no origin) and Postman
      if (!requestOrigin) return callback(null, true);

      // Check explicit list first
      if (explicitOrigins.includes(requestOrigin)) {
        return callback(null, true);
      }

      // Check dynamic multi-tenant subdomains
      try {
        const originUrl = new URL(requestOrigin);
        const hostname = originUrl.hostname;
        const isAllowedSubdomain = allowedBaseDomains.some((base) =>
          hostname.endsWith(base),
        );

        if (isAllowedSubdomain) {
          return callback(null, true);
        }
      } catch {
        // Invalid URL, reject
      }

      logger.warn(`Blocked CORS request from origin: ${requestOrigin}`);
      callback(new Error(`Not allowed by CORS: ${requestOrigin}`));
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'x-tenant-id',
      'Cache-Control',
    ],
    credentials: true,
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  const port = configService.get('PORT', 3001);
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 API running on port ${port}`);
  logger.log(`📍 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
}

bootstrap();
