import { EventRole } from '../common/domain.enums';
import { AccessCodesService } from './access-codes.service';

describe('AccessCodesService', () => {
  it('returns plaintext only once and persists only its hash', async () => {
    const codes = {
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => ({
        ...value,
        id: 'code-1',
        createdAt: new Date(),
      })),
    };
    const access = {
      requireRole: jest.fn().mockResolvedValue(EventRole.OWNER),
    };
    const config = {
      getOrThrow: jest.fn().mockReturnValue('pepper-used-for-tests'),
    };
    const service = new AccessCodesService(
      codes as never,
      {} as never,
      access as never,
      config as never,
    );

    const result = await service.create('owner-1', 'event-1', {
      role: EventRole.VIEWER,
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    });

    const persisted = codes.create.mock.calls[0]?.[0];
    expect(result.code).toMatch(/^TV-[A-Z0-9]+$/);
    expect(persisted.codeHash).toHaveLength(64);
    expect(persisted.codeHash).not.toContain(result.code);
    expect(persisted).not.toHaveProperty('code');
  });
});
