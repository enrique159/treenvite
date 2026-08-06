import { EventRole } from '../common/domain.enums';
import { EventAccessService } from './event-access.service';

describe('EventAccessService', () => {
  const grantBuilder = {
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };
  const events = { findOne: jest.fn() };
  const members = { findOne: jest.fn() };
  const grants = { createQueryBuilder: jest.fn(() => grantBuilder) };

  beforeEach(() => jest.clearAllMocks());

  it('always resolves the event owner as owner', async () => {
    events.findOne.mockResolvedValue({ id: 'event-1', ownerId: 'user-1' });
    const service = new EventAccessService(events as never, members as never, grants as never);

    await expect(service.getRole('event-1', 'user-1')).resolves.toBe(EventRole.OWNER);
    expect(members.findOne).not.toHaveBeenCalled();
  });

  it('prevents a viewer from performing editor actions', async () => {
    events.findOne.mockResolvedValue({ id: 'event-1', ownerId: 'owner-1' });
    members.findOne.mockResolvedValue({ role: EventRole.VIEWER });
    grantBuilder.getOne.mockResolvedValue(null);
    const service = new EventAccessService(events as never, members as never, grants as never);

    await expect(service.requireRole('event-1', 'viewer-1', EventRole.EDITOR)).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'EVENT_ACCESS_DENIED' }),
    });
  });
});
