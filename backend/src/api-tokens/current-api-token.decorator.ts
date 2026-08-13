import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApiTokenPermission } from '../common/domain.enums';

export interface ApiTokenPrincipal {
  id: string;
  eventId: string;
  permission: ApiTokenPermission;
}

export const CurrentApiToken = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ApiTokenPrincipal =>
    context.switchToHttp().getRequest<{ apiToken: ApiTokenPrincipal }>()
      .apiToken,
);
