import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET) identifies the API', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Gym4Me API');
  });

  it('/ready (GET) reports database/provider readiness', async () => {
    const response = await request(app.getHttpServer())
      .get('/ready')
      .expect(200);

    expect(response.body).toMatchObject({
      ready: true,
      database: true,
      providers: {
        sms: 'mock',
        payment: 'mock',
        push: 'mock',
      },
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
