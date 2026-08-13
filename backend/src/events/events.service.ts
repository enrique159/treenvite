import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { EventAccessGrant } from '../access-codes/entities/event-access-grant.entity';
import { ApiToken } from '../api-tokens/entities/api-token.entity';
import { ApiException } from '../common/api-exception';
import { EventRole, EventStatus } from '../common/domain.enums';
import { EventMember } from '../members/entities/event-member.entity';
import {
  CreateEventDto,
  EventListQueryDto,
  UpdateEventDto,
} from './dto/event.dto';
import { Event } from './entities/event.entity';
import { EventAccessService } from './event-access.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private readonly events: Repository<Event>,
    @InjectRepository(EventMember)
    private readonly members: Repository<EventMember>,
    @InjectRepository(EventAccessGrant)
    private readonly grants: Repository<EventAccessGrant>,
    @InjectRepository(ApiToken)
    private readonly apiTokens: Repository<ApiToken>,
    private readonly access: EventAccessService,
  ) {}

  async list(userId: string, query: EventListQueryDto) {
    const memberships = await this.members.find({
      where: { userId },
      select: { eventId: true },
    });
    const grants = await this.grants
      .createQueryBuilder('grant')
      .innerJoin('grant.accessCode', 'accessCode')
      .select('grant.eventId', 'eventId')
      .where('grant.userId = :userId', { userId })
      .andWhere('grant.expiresAt > :now', { now: new Date() })
      .andWhere('accessCode.expiresAt > :now', { now: new Date() })
      .andWhere('accessCode.revokedAt IS NULL')
      .getRawMany<{ eventId: string }>();
    const accessible = [
      ...new Set([
        ...memberships.map((item) => item.eventId),
        ...grants.map((item) => item.eventId),
      ]),
    ];
    const where = accessible.length
      ? [{ ownerId: userId }, { id: In(accessible) }]
      : [{ ownerId: userId }];
    const [items, total] = await this.events.findAndCount({
      where,
      order: { startsAt: 'ASC' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return { items, page: query.page, limit: query.limit, total };
  }

  async create(userId: string, dto: CreateEventDto): Promise<Event> {
    return this.events.save(
      this.events.create({
        ownerId: userId,
        name: dto.name.trim(),
        type: dto.type.trim(),
        startsAt: new Date(dto.startsAt),
        location: dto.location.trim(),
        status: EventStatus.DRAFT,
        color: dto.color ?? '#e96f51',
      }),
    );
  }

  async get(userId: string, id: string): Promise<Event & { role: EventRole }> {
    const role = await this.access.requireRole(id, userId, EventRole.VIEWER);
    const event = await this.events.findOne({ where: { id } });
    return Object.assign(event!, { role });
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateEventDto,
  ): Promise<Event> {
    await this.access.requireRole(id, userId, EventRole.EDITOR);
    const event = await this.events.findOne({ where: { id } });
    if (!event)
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'EVENT_NOT_FOUND',
        'El evento no existe',
      );
    if (dto.version && dto.version !== event.version) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'EVENT_VERSION_CONFLICT',
        'El evento cambió desde que lo abriste',
      );
    }
    if (dto.name !== undefined) event.name = dto.name.trim();
    if (dto.type !== undefined) event.type = dto.type.trim();
    if (dto.startsAt !== undefined) event.startsAt = new Date(dto.startsAt);
    if (dto.location !== undefined) event.location = dto.location.trim();
    if (dto.status !== undefined) event.status = dto.status;
    if (dto.color !== undefined) event.color = dto.color;
    return this.events.save(event);
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    await this.access.requireRole(id, userId, EventRole.OWNER);
    const event = await this.events.findOne({ where: { id } });
    if (event) {
      await this.apiTokens.update(
        { eventId: id, revokedAt: IsNull() },
        { revokedAt: new Date() },
      );
      await this.events.softRemove(event);
    }
    return { message: 'Evento eliminado' };
  }
}
