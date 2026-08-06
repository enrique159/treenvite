import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiException } from '../common/api-exception';
import { EventRole } from '../common/domain.enums';
import { EventAccessService } from '../events/event-access.service';
import { EventMember } from './entities/event-member.entity';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(EventMember)
    private readonly members: Repository<EventMember>,
    private readonly access: EventAccessService,
  ) {}

  async list(actorId: string, eventId: string) {
    await this.access.requireRole(eventId, actorId, EventRole.VIEWER);
    return this.members.find({
      where: { eventId },
      relations: { user: true },
      order: { createdAt: 'ASC' },
    });
  }

  async remove(actorId: string, eventId: string, memberId: string) {
    await this.access.requireRole(eventId, actorId, EventRole.OWNER);
    const member = await this.members.findOne({
      where: { id: memberId, eventId },
    });
    if (!member)
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'MEMBER_NOT_FOUND',
        'El colaborador no existe',
      );
    await this.members.remove(member);
    return { message: 'Acceso eliminado' };
  }
}
