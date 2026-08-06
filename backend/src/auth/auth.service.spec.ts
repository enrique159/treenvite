import { AuthService } from './auth.service';

describe('AuthService refresh sessions', () => {
  it('revokes the used refresh token and stores only the hash of its replacement', async () => {
    const oldSession = {
      id: 'old-session',
      user: { id: 'user-1', email: 'ana@example.com' },
      revokedAt: null,
    };
    const getOne = jest.fn().mockResolvedValue(oldSession);
    const queryBuilder = {
      addSelect: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne,
    };
    const sessions = {
      createQueryBuilder: jest.fn(() => queryBuilder),
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => ('id' in value ? value : { ...value, id: 'new-session' })),
    };
    const jwt = { signAsync: jest.fn().mockResolvedValue('new-access-token') };
    const config = {
      get: jest.fn().mockReturnValue('google-client-id'),
      getOrThrow: jest.fn().mockReturnValue('a-long-jwt-secret-used-only-in-tests'),
    };
    const service = new AuthService(
      {} as never,
      {} as never,
      sessions as never,
      {} as never,
      jwt as never,
      config as never,
      {} as never,
    );

    const result = await service.refresh('old-refresh-token', {});

    expect(oldSession.revokedAt).toBeInstanceOf(Date);
    expect(result.refreshToken).not.toBe('old-refresh-token');
    expect(sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({ tokenHash: expect.any(String), userId: 'user-1', revokedAt: null }),
    );
    expect(sessions.create.mock.calls[0]?.[0].tokenHash).not.toBe(result.refreshToken);
    expect(result.accessToken).toBe('new-access-token');
  });
});
