import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { ApiException } from '../common/api-exception';
import { EventRole } from '../common/domain.enums';
import { randomToken, sha256 } from '../common/hash.util';
import { EventAccessService } from '../events/event-access.service';
import {
  CreateAccessCodeDto,
  RedeemAccessCodeDto,
} from './dto/access-code.dto';
import { EventAccessCode } from './entities/event-access-code.entity';
import { EventAccessGrant } from './entities/event-access-grant.entity';

@Injectable()
export class AccessCodesService {
  private readonly pepper: string;

  constructor(
    @InjectRepository(EventAccessCode)
    private readonly codes: Repository<EventAccessCode>,
    @InjectRepository(EventAccessGrant)
    private readonly grants: Repository<EventAccessGrant>,
    private readonly access: EventAccessService,
    config: ConfigService,
  ) {
    this.pepper = config.getOrThrow<string>('ACCESS_CODE_PEPPER');
  }

  async list(actorId: string, eventId: string) {
    await this.access.requireRole(eventId, actorId, EventRole.OWNER);
    const codes = await this.codes.find({
      where: { eventId },
      order: { createdAt: 'DESC' },
    });
    return codes.map((code) => ({
      ...code,
      maskedCode: `••••-${code.codeSuffix}`,
      codeHash: undefined,
    }));
  }

  async create(actorId: string, eventId: string, dto: CreateAccessCodeDto) {
    await this.access.requireRole(eventId, actorId, EventRole.OWNER);
    const expiresAt = new Date(dto.expiresAt);
    if (expiresAt <= new Date())
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'INVALID_EXPIRATION',
        'La caducidad debe ser futura',
      );
    const plainCode = `TV-${randomToken(6)
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 8)
      .toUpperCase()}`;
    const code = await this.codes.save(
      this.codes.create({
        eventId,
        codeHash: this.hashCode(plainCode),
        codeSuffix: plainCode.slice(-4),
        role: dto.role,
        expiresAt,
        revokedAt: null,
        createdById: actorId,
      }),
    );
    return { ...code, codeHash: undefined, code: plainCode };
  }

  async revoke(actorId: string, eventId: string, codeId: string) {
    await this.access.requireRole(eventId, actorId, EventRole.OWNER);
    const code = await this.codes.findOne({ where: { id: codeId, eventId } });
    if (!code)
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'ACCESS_CODE_NOT_FOUND',
        'El código no existe',
      );
    code.revokedAt = new Date();
    await this.codes.save(code);
    return { message: 'Código revocado' };
  }

  async redeem(userId: string, dto: RedeemAccessCodeDto) {
    const normalized = dto.code.trim().toUpperCase();
    const code = await this.codes.findOne({
      where: {
        codeHash: this.hashCode(normalized),
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      relations: { event: true },
    });
    if (!code)
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'ACCESS_CODE_INVALID',
        'El código no existe o expiró',
      );
    let grant = await this.grants.findOne({
      where: { accessCodeId: code.id, userId },
    });
    if (grant) {
      grant.role = code.role;
      grant.expiresAt = code.expiresAt;
    } else {
      grant = this.grants.create({
        eventId: code.eventId,
        accessCodeId: code.id,
        userId,
        role: code.role,
        expiresAt: code.expiresAt,
      });
    }
    await this.grants.save(grant);
    return { event: code.event, role: code.role, expiresAt: code.expiresAt };
  }

  private hashCode(code: string): string {
    return sha256(`${this.pepper}:${code}`);
  }
}
