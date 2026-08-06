import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CsrfGuard } from '../auth/csrf.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { AuthenticatedUser } from '../common/current-user.decorator';
import { AccessCodesService } from './access-codes.service';
import {
  CreateAccessCodeDto,
  RedeemAccessCodeDto,
} from './dto/access-code.dto';

@ApiTags('access-codes')
@Controller()
@UseGuards(JwtAuthGuard)
export class AccessCodesController {
  constructor(private readonly codes: AccessCodesService) {}

  @Get('events/:eventId/access-codes')
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
  ) {
    return this.codes.list(user.id, eventId);
  }

  @Post('events/:eventId/access-codes')
  @UseGuards(CsrfGuard)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Body() dto: CreateAccessCodeDto,
  ) {
    return this.codes.create(user.id, eventId, dto);
  }

  @Delete('events/:eventId/access-codes/:codeId')
  @UseGuards(CsrfGuard)
  revoke(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Param('codeId') codeId: string,
  ) {
    return this.codes.revoke(user.id, eventId, codeId);
  }

  @Post('access-codes/redeem')
  @UseGuards(CsrfGuard)
  redeem(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RedeemAccessCodeDto,
  ) {
    return this.codes.redeem(user.id, dto);
  }
}
