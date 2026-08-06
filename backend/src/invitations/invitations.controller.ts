import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CsrfGuard } from '../auth/csrf.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { AuthenticatedUser } from '../common/current-user.decorator';
import { AcceptInvitationDto, CreateInvitationDto } from './dto/invitation.dto';
import { InvitationsService } from './invitations.service';

@ApiTags('invitations')
@Controller()
export class InvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  @Get('events/:eventId/invitations')
  @UseGuards(JwtAuthGuard)
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
  ) {
    return this.invitations.list(user.id, eventId);
  }

  @Post('events/:eventId/invitations')
  @UseGuards(JwtAuthGuard, CsrfGuard)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Body() dto: CreateInvitationDto,
  ) {
    return this.invitations.create(user.id, eventId, dto);
  }

  @Delete('events/:eventId/invitations/:invitationId')
  @UseGuards(JwtAuthGuard, CsrfGuard)
  revoke(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Param('invitationId') invitationId: string,
  ) {
    return this.invitations.revoke(user.id, eventId, invitationId);
  }

  @Get('invitations/preview')
  preview(@Query('token') token: string) {
    return this.invitations.preview(token);
  }

  @Post('invitations/accept')
  @UseGuards(JwtAuthGuard, CsrfGuard)
  accept(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AcceptInvitationDto,
  ) {
    return this.invitations.accept(user.id, dto);
  }
}
