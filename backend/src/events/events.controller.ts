import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CsrfGuard } from '../auth/csrf.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { AuthenticatedUser } from '../common/current-user.decorator';
import {
  CreateEventDto,
  EventListQueryDto,
  UpdateEventDto,
} from './dto/event.dto';
import { EventsService } from './events.service';

@ApiTags('events')
@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: EventListQueryDto,
  ) {
    return this.events.list(user.id, query);
  }

  @Post()
  @UseGuards(CsrfGuard)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateEventDto) {
    return this.events.create(user.id, dto);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.events.get(user.id, id);
  }

  @Patch(':id')
  @UseGuards(CsrfGuard)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.events.update(user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(CsrfGuard)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.events.remove(user.id, id);
  }
}
