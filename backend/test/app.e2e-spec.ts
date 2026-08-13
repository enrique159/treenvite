import './load-test-env';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import type { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { ApiTokensService } from '../src/api-tokens/api-tokens.service';
import { ApiToken } from '../src/api-tokens/entities/api-token.entity';
import {
  ApiTokenPermission,
  EventStatus,
  RsvpStatus,
} from '../src/common/domain.enums';
import { ApiExceptionFilter } from '../src/common/api-exception.filter';
import { Event } from '../src/events/entities/event.entity';
import { Guest } from '../src/guests/entities/guest.entity';
import { IntegrationsModule } from '../src/integrations/integrations.module';
import { User } from '../src/users/entities/user.entity';

jest.setTimeout(30_000);

const hasTestDatabase = Boolean(
  process.env.TEST_DB_HOST &&
  process.env.TEST_DB_NAME &&
  process.env.TEST_DB_USER,
);
const describeWithDatabase = hasTestDatabase ? describe : describe.skip;

describeWithDatabase('Treenvite API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new ApiExceptionFilter());
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

  it('builds an isolated OpenAPI contract for integration routes', () => {
    const config = new DocumentBuilder()
      .setTitle('Treenvite integrations')
      .addBearerAuth({ type: 'http', scheme: 'bearer' }, 'api-token')
      .build();
    const document = SwaggerModule.createDocument(app, config, {
      include: [IntegrationsModule],
    });
    const paths = Object.keys(document.paths);

    expect(paths).toEqual(
      expect.arrayContaining([
        '/api/v1/integrations/guests',
        '/api/v1/integrations/guests/{guestId}',
      ]),
    );
    expect(paths.some((path) => path.includes('/auth/'))).toBe(false);
    expect(document.components?.securitySchemes).toHaveProperty('api-token');
  });

  it('lists, reads and updates guests with event-scoped API tokens', async () => {
    const users = app.get<Repository<User>>(getRepositoryToken(User));
    const events = app.get<Repository<Event>>(getRepositoryToken(Event));
    const guests = app.get<Repository<Guest>>(getRepositoryToken(Guest));
    const apiTokenEntities = app.get<Repository<ApiToken>>(
      getRepositoryToken(ApiToken),
    );
    const apiTokens = app.get(ApiTokensService);
    const owner = await users.save(
      users.create({
        name: 'Propietario API',
        email: `api-owner-${Date.now()}@example.com`,
        avatarUrl: null,
        emailVerifiedAt: new Date(),
      }),
    );
    const event = await events.save(
      events.create({
        ownerId: owner.id,
        name: 'Evento API',
        type: 'Boda',
        startsAt: new Date('2027-01-01T20:00:00.000Z'),
        location: 'Mazatlán',
        status: EventStatus.ACTIVE,
        color: '#e96f51',
      }),
    );
    const guest = await guests.save(
      guests.create({
        eventId: event.id,
        parentId: null,
        name: 'Invitada API',
        email: 'guest@example.com',
        phone: null,
        groupName: 'Amistades',
        relationLabel: 'Amistad',
        invitedBySide: null,
        rsvp: RsvpStatus.PENDING,
        companions: 0,
        dietary: null,
        notes: null,
      }),
    );
    const writable = await apiTokens.create(owner.id, event.id, {
      name: 'E2E writable',
      permission: ApiTokenPermission.READ_WRITE,
    });

    await request(app.getHttpServer())
      .get('/api/v1/integrations/guests?page=1&limit=10')
      .set('Authorization', `Bearer ${writable.token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
            items: [expect.objectContaining({ id: guest.id })],
          }),
        );
      });

    await request(app.getHttpServer())
      .get(`/api/v1/integrations/guests/${guest.id}`)
      .set('Authorization', `Bearer ${writable.token}`)
      .expect(200)
      .expect(({ body }) => expect(body.id).toBe(guest.id));

    const updated = await request(app.getHttpServer())
      .patch(`/api/v1/integrations/guests/${guest.id}`)
      .set('Authorization', `Bearer ${writable.token}`)
      .send({
        rsvp: RsvpStatus.CONFIRMED,
        companions: 1,
        version: guest.version,
      })
      .expect(200);
    expect(updated.body).toEqual(
      expect.objectContaining({ rsvp: RsvpStatus.CONFIRMED, companions: 1 }),
    );

    await request(app.getHttpServer())
      .patch(`/api/v1/integrations/guests/${guest.id}`)
      .set('Authorization', `Bearer ${writable.token}`)
      .send({ notes: 'Versión anterior', version: guest.version })
      .expect(409)
      .expect(({ body }) => expect(body.code).toBe('GUEST_VERSION_CONFLICT'));

    const readOnly = await apiTokens.create(owner.id, event.id, {
      name: 'E2E read only',
      permission: ApiTokenPermission.READ,
    });
    await request(app.getHttpServer())
      .patch(`/api/v1/integrations/guests/${guest.id}`)
      .set('Authorization', `Bearer ${readOnly.token}`)
      .send({ notes: 'Sin permiso', version: updated.body.version })
      .expect(403);

    await apiTokens.revoke(owner.id, event.id, writable.id);
    await request(app.getHttpServer())
      .get('/api/v1/integrations/guests')
      .set('Authorization', `Bearer ${writable.token}`)
      .expect(401);

    await apiTokenEntities.update(readOnly.id, {
      expiresAt: new Date('2020-01-01T00:00:00.000Z'),
    });
    await request(app.getHttpServer())
      .get('/api/v1/integrations/guests')
      .set('Authorization', `Bearer ${readOnly.token}`)
      .expect(401);
  });
});
