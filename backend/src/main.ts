import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module';
import { loadEnvConfig } from './infrastructure/config/env.config';
import { GlobalHttpExceptionFilter } from './presentation/filters/http-exception.filter';

async function bootstrap(): Promise<void> {
  const env = loadEnvConfig();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');
  app.use(compression());

  app.enableCors({
    origin: env.corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  const uploadAbsDir = path.resolve(process.cwd(), env.uploadDir);
  fs.mkdirSync(uploadAbsDir, { recursive: true });
  app.useStaticAssets(uploadAbsDir, { prefix: '/uploads/fotos/' });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('API SIG UAGRM 2026-2 — Centros Internos (Grupo 16)')
    .setDescription(
      'API REST geoespacial para capas GeoJSON, catálogo facultativo, rutas peatonales pgRouting, consultas PostGIS y Realidad Aumentada.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDoc);

  await app.listen(env.port);
  console.log(`SIG UAGRM Backend escuchando en http://localhost:${env.port}/api`);
  console.log(`Swagger Docs disponible en http://localhost:${env.port}/api/docs`);
}

void bootstrap();
