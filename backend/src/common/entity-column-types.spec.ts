import { DataSource, getMetadataArgsStorage } from 'typeorm';
import { EventAccessCode } from '../access-codes/entities/event-access-code.entity';
import { EventAccessGrant } from '../access-codes/entities/event-access-grant.entity';
import { AuthIdentity } from '../auth/entities/auth-identity.entity';
import { AuthToken } from '../auth/entities/auth-token.entity';
import { RefreshSession } from '../auth/entities/refresh-session.entity';
import { Event } from '../events/entities/event.entity';
import { Guest } from '../guests/entities/guest.entity';
import { RelationSuggestion } from '../guests/entities/relation-suggestion.entity';
import { EventInvitation } from '../invitations/entities/event-invitation.entity';
import { EventMember } from '../members/entities/event-member.entity';
import { User } from '../users/entities/user.entity';

class MetadataDataSource extends DataSource {
  buildForTest(): Promise<void> {
    return this.buildMetadatas();
  }
}

describe('MySQL entity column types', () => {
  it.each([
    [AuthIdentity, 'passwordHash'],
    [RefreshSession, 'csrfHash'],
    [RefreshSession, 'userAgent'],
    [RefreshSession, 'ipAddress'],
    [Guest, 'parentId'],
    [Guest, 'email'],
    [Guest, 'phone'],
    [Guest, 'invitedBySide'],
    [RelationSuggestion, 'eventId'],
    [User, 'avatarUrl'],
  ])(
    '%s.%s declares varchar instead of relying on nullable union metadata',
    (entity, propertyName) => {
      const column = getMetadataArgsStorage().columns.find(
        (candidate) =>
          candidate.target === entity &&
          candidate.propertyName === propertyName,
      );

      expect(column?.options.type).toBe('varchar');
    },
  );

  it('builds every entity metadata definition with the MySQL driver', async () => {
    const dataSource = new MetadataDataSource({
      type: 'mysql',
      host: 'not-used',
      username: 'not-used',
      database: 'not-used',
      entities: [
        User,
        AuthIdentity,
        AuthToken,
        RefreshSession,
        Event,
        EventMember,
        EventInvitation,
        EventAccessCode,
        EventAccessGrant,
        Guest,
        RelationSuggestion,
      ],
    });

    await expect(dataSource.buildForTest()).resolves.toBeUndefined();
    expect(dataSource.entityMetadatas).toHaveLength(11);
  });
});
