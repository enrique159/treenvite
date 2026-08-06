import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CsrfGuard } from '../auth/csrf.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { AuthenticatedUser } from '../common/current-user.decorator';
import { MembersService } from './members.service';

@ApiTags('members')
@Controller('events/:eventId/members')
@UseGuards(JwtAuthGuard)
export class MembersController {
  constructor(private readonly members: MembersService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
  ) {
    return this.members.list(user.id, eventId);
  }

  @Delete(':memberId')
  @UseGuards(CsrfGuard)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.members.remove(user.id, eventId, memberId);
  }
}
