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

  // CORS configuration - Dinámico por entorno
  const frontendUrl = configService.get('FRONTEND_URL', 'http://localhost:3000');

  // En producción: solo dominios de producción
  // En desarrollo: incluir localhost
  const allowedOrigins = isProduction
    ? [
      'https://mauromera.com',
      'https://www.mauromera.com',
      frontendUrl, // Por si FRONTEND_URL está configurado
    ].filter((origin, index, arr) => arr.indexOf(origin) === index) // Eliminar duplicados
    : [
      frontendUrl,
      'http://localhost:3000',
      'http://localhost:3001',
    ];

  // Always log allowed origins for debugging
  logger.log(`Active CORS Origins: ${allowedOrigins.join(', ')}`);

  app.enableCors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) return callback(null, true); // Allow serverside/postman
      if (allowedOrigins.includes(requestOrigin)) {
        callback(null, true);
      } else {
        logger.warn(`Blocked CORS request from origin: ${requestOrigin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-tenant-id'],
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


