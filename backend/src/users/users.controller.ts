import {
  Body,
  Controller,
  Delete,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { CsrfGuard } from '../auth/csrf.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { AuthenticatedUser } from '../common/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly config: ConfigService,
  ) {}

  @Delete('me')
  @UseGuards(CsrfGuard)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.users.remove(user.id);
    this.clearCookies(res);
    return { message: 'Cuenta eliminada' };
  }

  @Patch('me')
  @UseGuards(CsrfGuard)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.users.update(user.id, dto);
  }

  private clearCookies(res: Response): void {
    const secure = this.config.get<boolean>('COOKIE_SECURE', false);
    for (const name of ['__Host-tv_access', 'tv_access'])
      res.clearCookie(name, { path: '/', secure });
    for (const name of ['__Secure-tv_refresh', 'tv_refresh'])
      res.clearCookie(name, { path: '/api/v1/auth', secure });
  }
}
