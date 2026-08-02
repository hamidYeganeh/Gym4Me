import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { mkdirSync } from 'fs';
import { AppModule } from './app.module';
import { setupSwagger, SWAGGER_PATH } from './swagger';

async function bootstrap() {
  mkdirSync(process.env.UPLOAD_DIR || './uploads', { recursive: true });

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableShutdownHooks();

  setupSwagger(app);

  const port = process.env.PORT ?? 8088;
  await app.listen(port);
  console.log(`Swagger UI: http://localhost:${port}/${SWAGGER_PATH}`);
}
bootstrap();
