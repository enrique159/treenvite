import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApiException } from '../common/api-exception';
import { ApiTokenPermission } from '../common/domain.enums';
import { EventAccessService } from '../events/event-access.service';
import { ApiTokensService } from './api-tokens.service';
import { ApiToken } from './entities/api-token.entity';

describe('ApiTokensService', () => {
  const queryBuilder = {
    innerJoin: jest.fn(),
    where: jest.fn(),
    andWhere: jest.fn(),
    getOne: jest.fn(),
  };
  Object.values(queryBuilder).forEach((mock) => {
    if (mock !== queryBuilder.getOne) mock.mockReturnValue(queryBuilder);
  });

  const repository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => ({
      id: 'token-1',
      createdAt: new Date('2026-08-13T12:00:00.000Z'),
      ...value,
    })),
    update: jest.fn(),
    createQueryBuilder: jest.fn(() => queryBuilder),
  };
  const access = { requireRole: jest.fn().mockResolvedValue('owner') };
  let service: ApiTokensService;

  beforeEach(async () => {
    jest.clearAllMocks();
    Object.values(queryBuilder).forEach((mock) => {
      if (mock !== queryBuilder.getOne) mock.mockReturnValue(queryBuilder);
    });
    const module = await Test.createTestingModule({
      providers: [
        ApiTokensService,
        { provide: getRepositoryToken(ApiToken), useValue: repository },
        { provide: EventAccessService, useValue: access },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn(() => 'a'.repeat(32)) },
        },
      ],
    }).compile();
    service = module.get(ApiTokensService);
  });

  it('returns a high-entropy token once and persists only its hash', async () => {
    const result = await service.create('owner-1', 'event-1', {
      name: '  CRM  ',
      permission: ApiTokenPermission.READ_WRITE,
    });

    expect(result.token).toMatch(/^tv_api_[A-Za-z0-9_-]{40,}$/);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'CRM',
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        tokenSuffix: result.token.slice(-4),
      }),
    );
    expect(repository.create.mock.calls[0][0].tokenHash).not.toContain(
      result.token,
    );
  });

  it('rejects an expiration in the past', async () => {
    await expect(
      service.create('owner-1', 'event-1', {
        name: 'CRM',
        permission: ApiTokenPermission.READ,
        expiresAt: '2020-01-01T00:00:00.000Z',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.BAD_REQUEST,
      response: expect.objectContaining({ code: 'INVALID_EXPIRATION' }),
    } as Partial<ApiException>);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('lists safe metadata and calculates token status', async () => {
    repository.find.mockResolvedValue([
      {
        id: 'active',
        name: 'CRM',
        tokenSuffix: '1234',
        tokenHash: 'secret-hash',
        permission: ApiTokenPermission.READ,
        expiresAt: null,
        revokedAt: null,
        lastUsedAt: null,
        createdAt: new Date('2026-08-13T12:00:00.000Z'),
      },
      {
        id: 'revoked',
        name: 'Legacy',
        tokenSuffix: '5678',
        permission: ApiTokenPermission.READ,
        expiresAt: null,
        revokedAt: new Date('2026-08-12T12:00:00.000Z'),
        lastUsedAt: null,
        createdAt: new Date('2026-08-10T12:00:00.000Z'),
      },
    ]);

    const result = await service.list('owner-1', 'event-1');

    expect(result.map((token) => token.status)).toEqual(['active', 'revoked']);
    expect(result[0]).not.toHaveProperty('tokenHash');
  });

  it('authenticates an active token and records its use', async () => {
    queryBuilder.getOne.mockResolvedValue({
      id: 'token-1',
      eventId: 'event-1',
      permission: ApiTokenPermission.READ,
    });

    await expect(service.authenticate('tv_api_secret')).resolves.toEqual({
      id: 'token-1',
      eventId: 'event-1',
      permission: ApiTokenPermission.READ,
    });
    expect(repository.update).toHaveBeenCalledWith('token-1', {
      lastUsedAt: expect.any(Date),
    });
  });

  it('rejects unknown tokens and write operations with read-only tokens', async () => {
    queryBuilder.getOne.mockResolvedValue(null);
    await expect(service.authenticate('invalid')).rejects.toMatchObject({
      status: HttpStatus.UNAUTHORIZED,
    } as Partial<ApiException>);
    expect(() =>
      service.requireWrite({
        id: 'token-1',
        eventId: 'event-1',
        permission: ApiTokenPermission.READ,
      }),
    ).toThrow(expect.objectContaining({ status: HttpStatus.FORBIDDEN }));
  });

  it('revokes a token idempotently', async () => {
    const token = { id: 'token-1', eventId: 'event-1', revokedAt: null };
    repository.findOne.mockResolvedValue(token);

    await service.revoke('owner-1', 'event-1', 'token-1');
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ revokedAt: expect.any(Date) }),
    );

    jest.clearAllMocks();
    repository.findOne.mockResolvedValue(token);
    await service.revoke('owner-1', 'event-1', 'token-1');
    expect(repository.save).not.toHaveBeenCalled();
  });
});
