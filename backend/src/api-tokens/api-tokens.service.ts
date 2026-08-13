import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiException } from '../common/api-exception';
import { ApiTokenPermission, EventRole } from '../common/domain.enums';
import { randomToken, sha256 } from '../common/hash.util';
import { EventAccessService } from '../events/event-access.service';
import type { ApiTokenPrincipal } from './current-api-token.decorator';
import { CreateApiTokenDto } from './dto/api-token.dto';
import { ApiToken } from './entities/api-token.entity';

export interface ApiTokenView {
  id: string;
  name: string;
  tokenSuffix: string;
  permission: ApiTokenPermission;
  status: 'active' | 'expired' | 'revoked';
  expiresAt: Date | null;
  revokedAt: Date | null;
  lastUsedAt: Date | null;
  createdAt: Date;
}

@Injectable()
export class ApiTokensService {
  private readonly pepper: string;

  constructor(
    @InjectRepository(ApiToken)
    private readonly apiTokens: Repository<ApiToken>,
    private readonly access: EventAccessService,
    config: ConfigService,
  ) {
    this.pepper = config.getOrThrow<string>('API_TOKEN_PEPPER');
  }

  async list(actorId: string, eventId: string): Promise<ApiTokenView[]> {
    await this.access.requireRole(eventId, actorId, EventRole.OWNER);
    const tokens = await this.apiTokens.find({
      where: { eventId },
      order: { createdAt: 'DESC' },
    });
    return tokens.map((token) => this.toView(token));
  }

  async create(actorId: string, eventId: string, dto: CreateApiTokenDto) {
    await this.access.requireRole(eventId, actorId, EventRole.OWNER);
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    if (expiresAt && expiresAt <= new Date()) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'INVALID_EXPIRATION',
        'La caducidad del token debe ser futura',
      );
    }

    const plainToken = `tv_api_${randomToken(32)}`;
    const token = await this.apiTokens.save(
      this.apiTokens.create({
        eventId,
        name: dto.name.trim(),
        tokenHash: this.hashToken(plainToken),
        tokenSuffix: plainToken.slice(-4),
        permission: dto.permission,
        expiresAt,
        revokedAt: null,
        lastUsedAt: null,
        createdById: actorId,
      }),
    );

    return { ...this.toView(token), token: plainToken };
  }

  async revoke(actorId: string, eventId: string, tokenId: string) {
    await this.access.requireRole(eventId, actorId, EventRole.OWNER);
    const token = await this.apiTokens.findOne({
      where: { id: tokenId, eventId },
    });
    if (!token) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'API_TOKEN_NOT_FOUND',
        'El token de API no existe',
      );
    }
    if (!token.revokedAt) {
      token.revokedAt = new Date();
      await this.apiTokens.save(token);
    }
    return { message: 'Token de API revocado' };
  }

  async authenticate(plainToken: string): Promise<ApiTokenPrincipal> {
    const token = await this.apiTokens
      .createQueryBuilder('token')
      .innerJoin('token.event', 'event')
      .where('token.tokenHash = :tokenHash', {
        tokenHash: this.hashToken(plainToken),
      })
      .andWhere('token.revokedAt IS NULL')
      .andWhere('(token.expiresAt IS NULL OR token.expiresAt > :now)', {
        now: new Date(),
      })
      .andWhere('event.deletedAt IS NULL')
      .getOne();
    if (!token) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'INVALID_API_TOKEN',
        'El token de API no es válido, expiró o fue revocado',
      );
    }

    token.lastUsedAt = new Date();
    await this.apiTokens.update(token.id, { lastUsedAt: token.lastUsedAt });
    return {
      id: token.id,
      eventId: token.eventId,
      permission: token.permission,
    };
  }

  requireWrite(principal: ApiTokenPrincipal): void {
    if (principal.permission !== ApiTokenPermission.READ_WRITE) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'API_TOKEN_INSUFFICIENT_PERMISSION',
        'El token no tiene permiso para actualizar invitados',
      );
    }
  }

  private hashToken(token: string): string {
    return sha256(`${this.pepper}:${token}`);
  }

  private toView(token: ApiToken): ApiTokenView {
    const status = token.revokedAt
      ? 'revoked'
      : token.expiresAt && token.expiresAt <= new Date()
        ? 'expired'
        : 'active';
    return {
      id: token.id,
      name: token.name,
      tokenSuffix: token.tokenSuffix,
      permission: token.permission,
      status,
      expiresAt: token.expiresAt,
      revokedAt: token.revokedAt,
      lastUsedAt: token.lastUsedAt,
      createdAt: token.createdAt,
    };
  }
}
