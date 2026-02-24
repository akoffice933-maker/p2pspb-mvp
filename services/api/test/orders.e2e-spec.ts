import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Orders API (e2e)', () => {
  let app: INestApplication;
  let createdOrderId: string;
  let testUserId = 'test_user_' + Date.now();

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

  describe('/api/orders (GET)', () => {
    it('should return empty array of orders', () => {
      return request(app.getHttpServer())
        .get('/api/orders')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter orders by type', () => {
      return request(app.getHttpServer())
        .get('/api/orders?type=BUY')
        .expect(200);
    });
  });

  describe('/api/orders/create (POST)', () => {
    it('should create a new SELL order', () => {
      const createOrderDto = {
        telegram_id: testUserId,
        username: '@testuser',
        type: 'SELL',
        rate: 92.5,
        min_limit: 1000,
        max_limit: 50000,
        amount: 1000,
        payment_methods: ['sbp'],
      };

      return request(app.getHttpServer())
        .post('/api/orders/create')
        .send(createOrderDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.type).toBe('SELL');
          expect(res.body.status).toBe('RESERVED');
          createdOrderId = res.body.id;
        });
    });

    it('should create a new BUY order', () => {
      const createOrderDto = {
        telegram_id: testUserId + '_buyer',
        username: '@buyer',
        type: 'BUY',
        rate: 91.0,
        min_limit: 500,
        max_limit: 10000,
        amount: 500,
        payment_methods: ['sbp', 'cash'],
      };

      return request(app.getHttpServer())
        .post('/api/orders/create')
        .send(createOrderDto)
        .expect(201);
    });

    it('should return 400 for missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/orders/create')
        .send({ telegram_id: '123' })
        .expect(400);
    });
  });

  describe('/api/orders/:id (GET)', () => {
    it('should return order by id', () => {
      return request(app.getHttpServer())
        .get(`/api/orders/${createdOrderId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', createdOrderId);
        });
    });

    it('should return 404 for non-existent order', () => {
      return request(app.getHttpServer())
        .get('/api/orders/non-existent-id')
        .expect(404);
    });
  });

  describe('/api/orders/:id/accept (POST)', () => {
    let buyOrderId: string;

    beforeAll(async () => {
      // Create a SELL order to accept
      const res = await request(app.getHttpServer())
        .post('/api/orders/create')
        .send({
          telegram_id: 'seller_' + Date.now(),
          username: '@seller',
          type: 'SELL',
          rate: 92.0,
          min_limit: 1000,
          max_limit: 10000,
          amount: 1000,
          payment_methods: ['sbp'],
        });
      buyOrderId = res.body.id;
    });

    it('should accept an order', () => {
      return request(app.getHttpServer())
        .post(`/api/orders/${buyOrderId}/accept`)
        .send({
          buyer_id: 'buyer_' + Date.now(),
          amount: 500,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.status).toBe('PAYMENT_PENDING');
        });
    });
  });

  describe('/api/orders/:id/cancel (POST)', () => {
    it('should cancel an order', () => {
      return request(app.getHttpServer())
        .post(`/api/orders/${createdOrderId}/cancel`)
        .send({ user_id: testUserId })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('CANCELLED');
        });
    });

    it('should return 400 for already cancelled order', () => {
      return request(app.getHttpServer())
        .post(`/api/orders/${createdOrderId}/cancel`)
        .send({ user_id: testUserId })
        .expect(400);
    });
  });
});
