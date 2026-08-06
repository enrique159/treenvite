import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { ApiException } from '../common/api-exception';
import { AuthenticatedUser } from '../common/current-user.decorator';
import { sha256 } from '../common/hash.util';
import { RefreshSession } from './entities/refresh-session.entity';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(
    @InjectRepository(RefreshSession)
    private readonly sessions: Repository<RefreshSession>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: AuthenticatedUser }>();
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return true;

    const token = request.header('x-csrf-token');
    const session = await this.sessions
      .createQueryBuilder('session')
      .addSelect('session.csrfHash')
      .where('session.id = :id', { id: request.user.sessionId })
      .andWhere('session.revokedAt IS NULL')
      .getOne();

    if (!token || !session?.csrfHash || sha256(token) !== session.csrfHash) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'INVALID_CSRF_TOKEN',
        'La sesión de seguridad expiró',
      );
    }
    return true;
  }
}
