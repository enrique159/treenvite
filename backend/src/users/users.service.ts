import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { EventAccessGrant } from '../access-codes/entities/event-access-grant.entity';
import { EventAccessCode } from '../access-codes/entities/event-access-code.entity';
import { ApiException } from '../common/api-exception';
import { Event } from '../events/entities/event.entity';
import { Guest } from '../guests/entities/guest.entity';
import { EventInvitation } from '../invitations/entities/event-invitation.entity';
import { EventMember } from '../members/entities/event-member.entity';
import { AuthIdentity } from '../auth/entities/auth-identity.entity';
import { AuthToken } from '../auth/entities/auth-token.entity';
import { RefreshSession } from '../auth/entities/refresh-session.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async update(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.users.findOneByOrFail({ id: userId });
    if (dto.name !== undefined) user.name = dto.name.trim();
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl;
    return this.users.save(user);
  }

  async remove(userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;
      const users = manager.getRepository(User);
      const user = await users.findOne({ where: { id: userId } });
      if (!user) {
        throw new ApiException(404, 'USER_NOT_FOUND', 'La cuenta ya no existe');
      }

      const events = manager.getRepository(Event);
      const ownedEvents = await events.find({
        withDeleted: true,
        where: { ownerId: userId },
        select: { id: true },
      });
      const eventIds = ownedEvents.map((event) => event.id);

      const guests = manager.getRepository(Guest);
      const grants = manager.getRepository(EventAccessGrant);
      const codes = manager.getRepository(EventAccessCode);
      const members = manager.getRepository(EventMember);
      const invitations = manager.getRepository(EventInvitation);

      if (eventIds.length) {
        // Guest.parent has RESTRICT, so detach the tree before removing its rows.
        await guests.update({ eventId: In(eventIds) }, { parentId: null });
        await grants.delete({ eventId: In(eventIds) });
        await codes.delete({ eventId: In(eventIds) });
        await members.delete({ eventId: In(eventIds) });
        await invitations.delete({ eventId: In(eventIds) });
        await guests.delete({ eventId: In(eventIds) });
        // delete() intentionally hard-deletes soft-deleted events too.
        await events.delete({ id: In(eventIds) });
      }

      // Remove invitations that expose this user's email or identify them as inviter.
      await invitations.delete({ invitedById: userId });
      await invitations.delete({ email: user.email });
      await grants.delete({ userId });
      await members.delete({ userId });
      await manager.getRepository(RefreshSession).delete({ userId });
      await manager.getRepository(AuthToken).delete({ userId });
      await manager.getRepository(AuthIdentity).delete({ userId });
      await users.delete(userId);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
