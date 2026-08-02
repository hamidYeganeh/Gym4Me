import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const SWAGGER_PATH = 'docs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Gym4Me API')
    .setDescription('Gym4Me HTTP API documentation')
    .setVersion('1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste a JWT access token from login / OTP confirm',
      },
      'access-token',
    )
    .addTag('auth', 'OTP login, password, and session management')
    .addTag('profile', 'Current user profile')
    .addTag('referral', 'Referral codes and invites')
    .addTag('kyc', 'Identity verification and documents')
    .addTag('admin', 'Admin user, KYC review, and audit endpoints')
    .addTag('admin-basics', 'Admin CRUD for choices, locations, sports, refs')
    .addTag('basics', 'Public taxonomies: choices, locations, sports, refs')
    .addTag('media', 'Media upload and file serving')
    .addTag('health', 'Health / ping')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Gym4Me API Docs',
  });
}
