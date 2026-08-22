import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { mkdirSync } from 'fs';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ApiMessageKeyFilter } from './common/filters/api-message-key.filter';
import { ApiMessageKeyInterceptor } from './common/interceptors/api-message-key.interceptor';
import {
  assertSecurityConfig,
  resolveCorsOrigin,
} from './common/utils/security-config.util';
import { createAppValidationPipe } from './common/utils/validation-exception.util';
import { setupSwagger, SWAGGER_PATH } from './swagger';

async function bootstrap() {
  assertSecurityConfig();

  mkdirSync(process.env.UPLOAD_DIR || './uploads', { recursive: true });

  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      // Media/SVG are not served inline as active documents; keep CSP off for API JSON.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableCors({
    origin: resolveCorsOrigin(),
    credentials: true,
  });
  app.useGlobalPipes(createAppValidationPipe());
  app.useGlobalFilters(new ApiMessageKeyFilter());
  app.useGlobalInterceptors(new ApiMessageKeyInterceptor());
  app.enableShutdownHooks();

  const enableSwagger =
    String(process.env.ENABLE_SWAGGER ?? '').toLowerCase() === 'true' ||
    (process.env.NODE_ENV ?? 'development').toLowerCase() !== 'production';
  if (enableSwagger) {
    setupSwagger(app);
  }

  const port = process.env.PORT ?? 8088;
  await app.listen(port);
  if (enableSwagger) {
    console.log(`Swagger UI: http://localhost:${port}/${SWAGGER_PATH}`);
  }
}
bootstrap();
