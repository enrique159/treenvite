import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { ApiException } from '../common/api-exception';
import { EventRole, InvitationStatus } from '../common/domain.enums';
import { randomToken, sha256 } from '../common/hash.util';
import { Event } from '../events/entities/event.entity';
import { EventAccessService } from '../events/event-access.service';
import { MailService } from '../mail/mail.service';
import { EventMember } from '../members/entities/event-member.entity';
import { User } from '../users/entities/user.entity';
import { AcceptInvitationDto, CreateInvitationDto } from './dto/invitation.dto';
import { EventInvitation } from './entities/event-invitation.entity';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(EventInvitation) private readonly invitations: Repository<EventInvitation>,
    @InjectRepository(EventMember) private readonly members: Repository<EventMember>,
    @InjectRepository(Event) private readonly events: Repository<Event>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly access: EventAccessService,
    private readonly mail: MailService,
  ) {}

  async list(actorId: string, eventId: string) {
    await this.access.requireRole(eventId, actorId, EventRole.OWNER);
    return this.invitations.find({ where: { eventId }, order: { createdAt: 'DESC' } });
  }

  async create(actorId: string, eventId: string, dto: CreateInvitationDto) {
    await this.access.requireRole(eventId, actorId, EventRole.OWNER);
    const event = await this.events.findOne({ where: { id: eventId } });
    const email = dto.email.trim().toLowerCase();
    const raw = randomToken(32);
    const invitation = await this.invitations.save(
      this.invitations.create({
        eventId,
        email,
        role: dto.role,
        status: InvitationStatus.PENDING,
        tokenHash: sha256(raw),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        acceptedAt: null,
        invitedById: actorId,
      }),
    );
    await this.mail.sendInvitation(email, event!.name, raw);
    return invitation;
  }

  async preview(raw: string) {
    const invitation = await this.findActive(raw);
    const event = await this.events.findOne({ where: { id: invitation.eventId }, select: { id: true, name: true } });
    const [name, domain] = invitation.email.split('@');
    return { event, email: `${name.slice(0, 2)}***@${domain}`, role: invitation.role, expiresAt: invitation.expiresAt };
  }

  async accept(userId: string, dto: AcceptInvitationDto) {
    const invitation = await this.findActive(dto.token);
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user || user.email !== invitation.email) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'INVITATION_EMAIL_MISMATCH', 'La invitación pertenece a otro correo');
    }
    let member = await this.members.findOne({ where: { eventId: invitation.eventId, userId } });
    if (!member) {
      member = await this.members.save(
        this.members.create({ eventId: invitation.eventId, userId, role: invitation.role }),
      );
    }
    invitation.status = InvitationStatus.ACCEPTED;
    invitation.acceptedAt = new Date();
    await this.invitations.save(invitation);
    return member;
  }

  async revoke(actorId: string, eventId: string, invitationId: string) {
    await this.access.requireRole(eventId, actorId, EventRole.OWNER);
    const invitation = await this.invitations.findOne({ where: { id: invitationId, eventId } });
    if (!invitation) throw new ApiException(HttpStatus.NOT_FOUND, 'INVITATION_NOT_FOUND', 'La invitación no existe');
    invitation.status = InvitationStatus.REVOKED;
    await this.invitations.save(invitation);
    return { message: 'Invitación revocada' };
  }

  private async findActive(raw: string): Promise<EventInvitation> {
    const invitation = await this.invitations.findOne({
      where: {
        tokenHash: sha256(raw),
        status: InvitationStatus.PENDING,
        expiresAt: MoreThan(new Date()),
      },
    });
    if (!invitation) throw new ApiException(HttpStatus.BAD_REQUEST, 'INVITATION_INVALID', 'La invitación no existe o expiró');
    return invitation;
  }
}
