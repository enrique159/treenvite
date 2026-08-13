import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CsrfGuard } from '../auth/csrf.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { AuthenticatedUser } from '../common/current-user.decorator';
import { ApiTokensService } from './api-tokens.service';
import { CreateApiTokenDto } from './dto/api-token.dto';

@Controller('events/:eventId/api-tokens')
@UseGuards(JwtAuthGuard)
export class ApiTokensController {
  constructor(private readonly apiTokens: ApiTokensService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
  ) {
    return this.apiTokens.list(user.id, eventId);
  }

  @Post()
  @UseGuards(CsrfGuard)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Body() dto: CreateApiTokenDto,
  ) {
    return this.apiTokens.create(user.id, eventId, dto);
  }

  @Delete(':tokenId')
  @UseGuards(CsrfGuard)
  revoke(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Param('tokenId') tokenId: string,
  ) {
    return this.apiTokens.revoke(user.id, eventId, tokenId);
  }
}
