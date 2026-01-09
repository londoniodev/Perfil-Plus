import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Confiar en el proxy inverso (Nginx/Traefik/etc)
  // Esto asegura que req.hostname y req.ip sean correctos
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  const configService = app.get(ConfigService);

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

  // CORS configuration
  const frontendUrl = configService.get('FRONTEND_URL', 'http://localhost:3000');
  const allowedOrigins = [
    frontendUrl,
    'http://localhost:3000',
    'https://mauromera.com',
    'https://www.mauromera.com',
  ];
  console.log('🔧 CORS configured for:', allowedOrigins);

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  const port = configService.get('PORT', 3001);
  await app.listen(port);

  console.log(`🚀 API running on: http://localhost:${port}/api`);
}

bootstrap();
