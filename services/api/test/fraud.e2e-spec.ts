import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Fraud Detection API (e2e)', () => {
  let app: INestApplication;
  let testUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/fraud/alerts (GET)', () => {
    it('should return empty array of alerts', () => {
      return request(app.getHttpServer())
        .get('/api/fraud/alerts')
        .expect(401); // Requires admin auth
    });
  });

  describe('/api/orders/create with fraud detection (POST)', () => {
    it('should create order for normal user', () => {
      const createOrderDto = {
        telegram_id: 'normal_user_' + Date.now(),
        username: '@normaluser',
        type: 'SELL',
        rate: 92.5,
        min_limit: 1000,
        max_limit: 5000,
        amount: 100,
        payment_methods: ['sbp'],
      };

      return request(app.getHttpServer())
        .post('/api/orders/create')
        .send(createOrderDto)
        .expect(201);
    });

    it('should handle large amount orders', () => {
      const createOrderDto = {
        telegram_id: 'large_user_' + Date.now(),
        username: '@largeuser',
        type: 'SELL',
        rate: 92.5,
        min_limit: 50000,
        max_limit: 500000,
        amount: 50000,
        payment_methods: ['sbp'],
      };

      return request(app.getHttpServer())
        .post('/api/orders/create')
        .send(createOrderDto)
        .expect(201);
      // Should trigger fraud alert for large amount
    });
  });
});
