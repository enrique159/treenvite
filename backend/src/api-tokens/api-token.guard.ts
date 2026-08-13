import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiException } from '../common/api-exception';
import { ApiTokensService } from './api-tokens.service';
import type { ApiTokenPrincipal } from './current-api-token.decorator';

@Injectable()
export class ApiTokenGuard implements CanActivate {
  constructor(private readonly apiTokens: ApiTokensService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { apiToken: ApiTokenPrincipal }>();
    const authorization = request.header('authorization');
    const match = authorization?.match(/^Bearer\s+(\S+)$/i);
    if (!match) throw this.unauthorized();

    request.apiToken = await this.apiTokens.authenticate(match[1]);
    return true;
  }

  private unauthorized(): ApiException {
    return new ApiException(
      HttpStatus.UNAUTHORIZED,
      'INVALID_API_TOKEN',
      'El token de API no es válido, expiró o fue revocado',
    );
  }
}
