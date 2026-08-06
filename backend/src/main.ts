import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/api-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const frontendOrigin = config.getOrThrow<string>('FRONTEND_ORIGIN');

  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: frontendOrigin,
    credentials: true,
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
  });
  app.use((request: Request, response: Response, next: NextFunction) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      const origin = request.header('origin');
      if (origin !== frontendOrigin) {
        response.status(403).json({
          statusCode: 403,
          code: 'ORIGIN_NOT_ALLOWED',
          message: 'Origen no permitido',
          details: null,
        });
        return;
      }
    }
    next();
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());

  if (config.get<string>('NODE_ENV') !== 'production') {
    const swagger = new DocumentBuilder()
      .setTitle('Treenvite API')
      .setVersion('1.0')
      .addCookieAuth('tv_access')
      .build();
    SwaggerModule.setup(
      'api/docs',
      app,
      SwaggerModule.createDocument(app, swagger),
    );
  }

  await app.listen(config.get<number>('PORT', 3000));
}
void bootstrap();
