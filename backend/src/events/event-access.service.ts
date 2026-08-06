import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventAccessGrant } from '../access-codes/entities/event-access-grant.entity';
import { ApiException } from '../common/api-exception';
import { EventRole } from '../common/domain.enums';
import { EventMember } from '../members/entities/event-member.entity';
import { Event } from './entities/event.entity';

const rank: Record<EventRole, number> = {
  [EventRole.VIEWER]: 1,
  [EventRole.EDITOR]: 2,
  [EventRole.OWNER]: 3,
};

@Injectable()
export class EventAccessService {
  constructor(
    @InjectRepository(Event) private readonly events: Repository<Event>,
    @InjectRepository(EventMember) private readonly members: Repository<EventMember>,
    @InjectRepository(EventAccessGrant) private readonly grants: Repository<EventAccessGrant>,
  ) {}

  async getRole(eventId: string, userId: string): Promise<EventRole | null> {
    const event = await this.events.findOne({ where: { id: eventId }, select: { id: true, ownerId: true } });
    if (!event) throw new ApiException(HttpStatus.NOT_FOUND, 'EVENT_NOT_FOUND', 'El evento no existe');
    if (event.ownerId === userId) return EventRole.OWNER;

    const member = await this.members.findOne({ where: { eventId, userId } });
    const grant = await this.grants
      .createQueryBuilder('grant')
      .innerJoinAndSelect('grant.accessCode', 'code')
      .where('grant.eventId = :eventId', { eventId })
      .andWhere('grant.userId = :userId', { userId })
      .andWhere('grant.expiresAt > :now', { now: new Date() })
      .andWhere('code.revokedAt IS NULL')
      .andWhere('code.expiresAt > :now', { now: new Date() })
      .getOne();

    if (!member && !grant) return null;
    if (!member) return grant!.role;
    if (!grant) return member.role;
    return rank[member.role] >= rank[grant.role] ? member.role : grant.role;
  }

  async requireRole(eventId: string, userId: string, required: EventRole): Promise<EventRole> {
    const role = await this.getRole(eventId, userId);
    if (!role || rank[role] < rank[required]) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'EVENT_ACCESS_DENIED', 'No tienes permiso para realizar esta acción');
    }
    return role;
  }
}
