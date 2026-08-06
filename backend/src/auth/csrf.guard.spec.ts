import { ExecutionContext } from '@nestjs/common';
import { CsrfGuard } from './csrf.guard';
import { sha256 } from '../common/hash.util';

describe('CsrfGuard', () => {
  const getOne = jest.fn();
  const queryBuilder = {
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne,
  };
  const repository = { createQueryBuilder: jest.fn(() => queryBuilder) };
  const context = (token?: string) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          user: { id: 'user-1', sessionId: 'session-1' },
          header: (name: string) => (name === 'x-csrf-token' ? token : undefined),
        }),
      }),
    }) as ExecutionContext;

  beforeEach(() => jest.clearAllMocks());

  it('accepts a token linked to the authenticated session', async () => {
    getOne.mockResolvedValue({ csrfHash: sha256('valid-token') });
    const guard = new CsrfGuard(repository as never);

    await expect(guard.canActivate(context('valid-token'))).resolves.toBe(true);
    expect(queryBuilder.where).toHaveBeenCalledWith('session.id = :id', { id: 'session-1' });
  });

  it('rejects a missing or mismatched token', async () => {
    getOne.mockResolvedValue({ csrfHash: sha256('valid-token') });
    const guard = new CsrfGuard(repository as never);

    await expect(guard.canActivate(context('wrong-token'))).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'INVALID_CSRF_TOKEN' }),
    });
  });
});
