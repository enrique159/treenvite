import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

const hasTestDatabase = Boolean(
  process.env.TEST_DB_HOST &&
  process.env.TEST_DB_NAME &&
  process.env.TEST_DB_USER,
);
const describeWithDatabase = hasTestDatabase ? describe : describe.skip;

describeWithDatabase('Treenvite API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DB_HOST = process.env.TEST_DB_HOST;
    process.env.DB_PORT = process.env.TEST_DB_PORT ?? '3306';
    process.env.DB_NAME = process.env.TEST_DB_NAME;
    process.env.DB_USER = process.env.TEST_DB_USER;
    process.env.DB_PASSWORD = process.env.TEST_DB_PASSWORD ?? '';
    process.env.FRONTEND_ORIGIN = 'http://localhost:5173';
    process.env.JWT_ACCESS_SECRET =
      'test-access-secret-with-at-least-32-characters';
    process.env.ACCESS_CODE_PEPPER = 'test-code-pepper-with-enough-characters';
    const { AppModule } = await import('../src/app.module');
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => app?.close());

  it('creates the synchronized schema and responds to health checks', async () => {
    await request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({ status: 'ok', service: 'treenvite-api' }),
        );
      });
  });

  it('registers an account', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .set('Origin', 'http://localhost:5173')
      .send({
        name: 'Prueba Treenvite',
        email: `test-${Date.now()}@example.com`,
        password: 'correct-horse-123',
      })
      .expect(201);
  });
});
