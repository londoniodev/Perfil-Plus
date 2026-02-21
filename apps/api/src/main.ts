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
  app.use(helmet({
    contentSecurityPolicy: false, // Manejado por Next.js frontend
    crossOriginEmbedderPolicy: false, // Permitir embeds (videos, iframes)
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Permite cargar recursos desde otros dominios
  }));

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

  // CORS configuration - Multi-tenant (from env var)
  // CORS_ORIGINS should contain comma-separated list of all tenant frontend URLs
  const corsOriginsEnv = configService.get<string>('CORS_ORIGINS', '');
  const corsOriginsList = corsOriginsEnv
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  // In development, always allow localhost
  const devOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'];
  const allowedOrigins = isProduction
    ? corsOriginsList
    : [...corsOriginsList, ...devOrigins];

  logger.log(`Active CORS Origins (${allowedOrigins.length}): ${allowedOrigins.join(', ') || 'NONE - check CORS_ORIGINS env var!'}`);

  app.enableCors({
    origin: (requestOrigin, callback) => {
      // Allow server-side requests (no origin) and Postman
      if (!requestOrigin) return callback(null, true);

      // Debug log
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[CORS] Checking origin: ${requestOrigin}`);
      }

      // Check if origin is in the allowed list
      if (allowedOrigins.includes(requestOrigin)) {
        callback(null, true);
      } else {
        logger.warn(`Blocked CORS request from origin: ${requestOrigin}`);
        callback(new Error(`Not allowed by CORS: ${requestOrigin}`));
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'x-tenant-id'],
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


