import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CsrfGuard } from '../auth/csrf.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { AuthenticatedUser } from '../common/current-user.decorator';
import { CreateGuestDto, GuestListQueryDto, UpdateGuestDto } from './dto/guest.dto';
import { GuestsService } from './guests.service';

@ApiTags('guests')
@Controller('events/:eventId/guests')
@UseGuards(JwtAuthGuard)
export class GuestsController {
  constructor(private readonly guests: GuestsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Param('eventId') eventId: string, @Query() query: GuestListQueryDto) {
    return this.guests.list(user.id, eventId, query);
  }

  @Get('tree')
  tree(@CurrentUser() user: AuthenticatedUser, @Param('eventId') eventId: string) {
    return this.guests.tree(user.id, eventId);
  }

  @Get('export.csv')
  async export(@CurrentUser() user: AuthenticatedUser, @Param('eventId') eventId: string, @Res() response: Response) {
    const csv = await this.guests.exportCsv(user.id, eventId);
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', `attachment; filename="treenvite-${eventId}.csv"`);
    response.send(csv);
  }

  @Post()
  @UseGuards(CsrfGuard)
  create(@CurrentUser() user: AuthenticatedUser, @Param('eventId') eventId: string, @Body() dto: CreateGuestDto) {
    return this.guests.create(user.id, eventId, dto);
  }

  @Patch(':guestId')
  @UseGuards(CsrfGuard)
  update(@CurrentUser() user: AuthenticatedUser, @Param('eventId') eventId: string, @Param('guestId') guestId: string, @Body() dto: UpdateGuestDto) {
    return this.guests.update(user.id, eventId, guestId, dto);
  }

  @Delete(':guestId')
  @UseGuards(CsrfGuard)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('eventId') eventId: string, @Param('guestId') guestId: string) {
    return this.guests.remove(user.id, eventId, guestId);
  }
}
