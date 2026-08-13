import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiException } from '../common/api-exception';
import { EventRole, GuestSide, RsvpStatus } from '../common/domain.enums';
import { EventAccessService } from '../events/event-access.service';
import {
  CreateGuestDto,
  GuestListQueryDto,
  UpdateGuestDto,
} from './dto/guest.dto';
import { Guest } from './entities/guest.entity';
import { RelationSuggestionsService } from './relation-suggestions.service';

function normalizeOptionalContact(
  value: string | null | undefined,
): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeOptionalEmail(value: string | null | undefined) {
  return normalizeOptionalContact(value)?.toLowerCase() ?? null;
}

@Injectable()
export class GuestsService {
  constructor(
    @InjectRepository(Guest) private readonly guests: Repository<Guest>,
    private readonly access: EventAccessService,
    private readonly relationSuggestions: RelationSuggestionsService,
  ) {}

  async list(userId: string, eventId: string, query: GuestListQueryDto) {
    await this.access.requireRole(eventId, userId, EventRole.VIEWER);
    const builder = this.guests
      .createQueryBuilder('guest')
      .where('guest.eventId = :eventId', { eventId });
    if (query.search) {
      builder.andWhere(
        '(guest.name LIKE :search OR guest.email LIKE :search OR guest.phone LIKE :search)',
        {
          search: `%${query.search.trim()}%`,
        },
      );
    }
    if (query.rsvp)
      builder.andWhere('guest.rsvp = :rsvp', { rsvp: query.rsvp });
    if (query.group)
      builder.andWhere('guest.groupName = :group', { group: query.group });
    const allowedSort = ['name', 'groupName', 'rsvp', 'createdAt'].includes(
      query.sort,
    )
      ? query.sort
      : 'name';
    const direction = query.direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    builder
      .orderBy(`guest.${allowedSort}`, direction)
      .skip((query.page - 1) * query.limit)
      .take(query.limit);
    const [items, total] = await builder.getManyAndCount();
    return { items, page: query.page, limit: query.limit, total };
  }

  async tree(userId: string, eventId: string): Promise<Guest[]> {
    await this.access.requireRole(eventId, userId, EventRole.VIEWER);
    return this.guests.find({ where: { eventId }, order: { name: 'ASC' } });
  }

  async create(
    userId: string,
    eventId: string,
    dto: CreateGuestDto,
  ): Promise<Guest> {
    await this.access.requireRole(eventId, userId, EventRole.EDITOR);
    await this.validateParent(eventId, dto.parentId ?? null);
    const relationLabel = await this.relationSuggestions.resolve(
      eventId,
      dto.relationLabel ?? 'Invitado',
    );
    return this.guests.save(
      this.guests.create({
        eventId,
        parentId: dto.parentId ?? null,
        name: dto.name.trim(),
        email: normalizeOptionalEmail(dto.email),
        phone: normalizeOptionalContact(dto.phone),
        groupName: dto.groupName?.trim() ?? 'Sin grupo',
        relationLabel,
        invitedBySide: dto.invitedBySide ?? null,
        rsvp: dto.rsvp ?? RsvpStatus.PENDING,
        companions: dto.companions ?? 0,
        dietary: dto.dietary?.trim() ?? null,
        notes: dto.notes?.trim() ?? null,
      }),
    );
  }

  async update(
    userId: string,
    eventId: string,
    guestId: string,
    dto: UpdateGuestDto,
  ): Promise<Guest> {
    await this.access.requireRole(eventId, userId, EventRole.EDITOR);
    const guest = await this.guests.findOne({
      where: { id: guestId, eventId },
    });
    if (!guest)
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'GUEST_NOT_FOUND',
        'El invitado no existe',
      );
    if (dto.version && dto.version !== guest.version) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'GUEST_VERSION_CONFLICT',
        'El invitado cambió desde que lo abriste',
      );
    }
    if (dto.parentId !== undefined) {
      await this.validateParent(eventId, dto.parentId, guestId);
      guest.parentId = dto.parentId;
    }
    if (dto.name !== undefined) guest.name = dto.name.trim();
    if (dto.email !== undefined)
      guest.email = normalizeOptionalEmail(dto.email);
    if (dto.phone !== undefined)
      guest.phone = normalizeOptionalContact(dto.phone);
    if (dto.groupName !== undefined) guest.groupName = dto.groupName.trim();
    if (dto.relationLabel !== undefined)
      guest.relationLabel = await this.relationSuggestions.resolve(
        eventId,
        dto.relationLabel,
      );
    if (dto.invitedBySide !== undefined)
      guest.invitedBySide = dto.invitedBySide;
    if (dto.rsvp !== undefined) guest.rsvp = dto.rsvp;
    if (dto.companions !== undefined) guest.companions = dto.companions;
    if (dto.dietary !== undefined) guest.dietary = dto.dietary?.trim() ?? null;
    if (dto.notes !== undefined) guest.notes = dto.notes?.trim() ?? null;
    return this.guests.save(guest);
  }

  async remove(userId: string, eventId: string, guestId: string) {
    await this.access.requireRole(eventId, userId, EventRole.EDITOR);
    const guest = await this.guests.findOne({
      where: { id: guestId, eventId },
    });
    if (!guest)
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'GUEST_NOT_FOUND',
        'El invitado no existe',
      );
    const children = await this.guests.find({
      where: { eventId, parentId: guestId },
      select: { id: true, name: true },
    });
    if (children.length) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'GUEST_HAS_CHILDREN',
        'Reasigna las relaciones antes de eliminar este invitado',
        { children },
      );
    }
    await this.guests.remove(guest);
    return { message: 'Invitado eliminado' };
  }

  async exportCsv(userId: string, eventId: string): Promise<string> {
    await this.access.requireRole(eventId, userId, EventRole.VIEWER);
    const guests = await this.guests.find({
      where: { eventId },
      order: { name: 'ASC' },
    });
    const status: Record<RsvpStatus, string> = {
      [RsvpStatus.CONFIRMED]: 'Confirmado',
      [RsvpStatus.PENDING]: 'Pendiente',
      [RsvpStatus.DECLINED]: 'No asiste',
    };
    const escape = (value: string | number | null) =>
      `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = guests.map((guest) =>
      [
        guest.name,
        guest.email,
        guest.phone,
        guest.groupName,
        guest.relationLabel,
        guest.invitedBySide === GuestSide.GROOM
          ? 'Novio'
          : guest.invitedBySide === GuestSide.BRIDE
            ? 'Novia'
            : '',
        status[guest.rsvp],
        guest.companions,
        guest.dietary,
        guest.notes,
      ]
        .map(escape)
        .join(','),
    );
    return `\uFEFF${['Nombre', 'Correo', 'Teléfono', 'Grupo', 'Relación', 'Por parte de', 'Confirmación', 'Acompañantes', 'Alimentación', 'Notas'].map(escape).join(',')}\n${rows.join('\n')}`;
  }

  private async validateParent(
    eventId: string,
    parentId: string | null,
    guestId?: string,
  ): Promise<void> {
    if (!parentId) return;
    if (parentId === guestId)
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'GUEST_TREE_CYCLE',
        'Un invitado no puede relacionarse consigo mismo',
      );
    let current = await this.guests.findOne({
      where: { id: parentId, eventId },
    });
    if (!current)
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'PARENT_NOT_IN_EVENT',
        'La relación no pertenece al evento',
      );
    const visited = new Set<string>();
    while (current) {
      if (current.id === guestId || visited.has(current.id)) {
        throw new ApiException(
          HttpStatus.BAD_REQUEST,
          'GUEST_TREE_CYCLE',
          'La relación crearía un ciclo en el árbol',
        );
      }
      visited.add(current.id);
      if (!current.parentId) break;
      current = await this.guests.findOne({
        where: { id: current.parentId, eventId },
      });
      if (!current) break;
    }
  }
}
