import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentUser } from '../common/current-user.decorator';
import type { AuthenticatedUser } from '../common/current-user.decorator';
import { AuthService, SessionResult } from './auth.service';
import { CsrfGuard } from './csrf.guard';
import { EmailDto, GoogleAuthDto, LoginDto, RegisterDto, ResetPasswordDto, TokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly config: ConfigService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.setSession(res, await this.auth.login(dto, this.meta(req)));
  }

  @Post('google')
  async google(@Body() dto: GoogleAuthDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.setSession(res, await this.auth.googleLogin(dto, this.meta(req)));
  }

  @Post('refresh')
  async refresh(@Req() req: Request & { cookies?: Record<string, string> }, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.['__Secure-tv_refresh'] ?? req.cookies?.tv_refresh;
    return this.setSession(res, await this.auth.refresh(token, this.meta(req)));
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard, CsrfGuard)
  async logout(@Req() req: Request & { cookies?: Record<string, string> }, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.['__Secure-tv_refresh'] ?? req.cookies?.tv_refresh;
    await this.auth.logout(token);
    this.clearCookies(res);
    return { message: 'Sesión cerrada' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.me(user.id);
  }

  @Get('csrf')
  @UseGuards(JwtAuthGuard)
  async csrf(@CurrentUser() user: AuthenticatedUser) {
    return { csrfToken: await this.auth.createCsrf(user.sessionId) };
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: TokenDto) {
    return this.auth.verifyEmail(dto);
  }

  @Post('resend-verification')
  resend(@Body() dto: EmailDto) {
    return this.auth.resendVerification(dto);
  }

  @Post('forgot-password')
  forgot(@Body() dto: EmailDto) {
    return this.auth.forgotPassword(dto);
  }

  @Post('reset-password')
  reset(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  private meta(req: Request) {
    return { userAgent: req.header('user-agent'), ip: req.ip };
  }

  private setSession(res: Response, session: SessionResult) {
    const secure = this.config.get<boolean>('COOKIE_SECURE', false);
    res.cookie(secure ? '__Host-tv_access' : 'tv_access', session.accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie(secure ? '__Secure-tv_refresh' : 'tv_refresh', session.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/api/v1/auth',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return { user: session.user };
  }

  private clearCookies(res: Response): void {
    for (const name of ['__Host-tv_access', 'tv_access']) res.clearCookie(name, { path: '/' });
    for (const name of ['__Secure-tv_refresh', 'tv_refresh']) res.clearCookie(name, { path: '/api/v1/auth' });
  }
}
