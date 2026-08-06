import { EventRole, InvitationStatus } from '../common/domain.enums';
import { InvitationsService } from './invitations.service';

describe('InvitationsService', () => {
  it('accepts an invitation only for the exact account email', async () => {
    const invitations = {
      findOne: jest.fn().mockResolvedValue({
        id: 'invite-1',
        eventId: 'event-1',
        email: 'invitada@example.com',
        role: EventRole.EDITOR,
        status: InvitationStatus.PENDING,
      }),
    };
    const users = {
      findOne: jest
        .fn()
        .mockResolvedValue({ id: 'user-1', email: 'otra@example.com' }),
    };
    const service = new InvitationsService(
      invitations as never,
      {} as never,
      {} as never,
      users as never,
      {} as never,
      {} as never,
    );

    await expect(
      service.accept('user-1', { token: 'invitation-token' }),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'INVITATION_EMAIL_MISMATCH' }),
    });
  });
});
