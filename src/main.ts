import { NestFactory } from '@nestjs/core';
import {
  StandardSchemaValidationPipe,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';
import { TransformResponseInterceptor } from './core/Interceptors/transform-response.interceptor.js';
import { AllExceptionsFilter } from './core/filters/prisma-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.use(cookieParser());

  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  app.enableCors({
    origin: config.getOrThrow<string>('FRONTEND_URI'),
    credentials: true,
  });

  await app.listen(config.get<number>('PORT', 3000));
}

void bootstrap();
