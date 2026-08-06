import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUser } from '../common/current-user.decorator';

interface JwtPayload {
  sub: string;
  email: string;
  sid: string;
}

function accessCookie(request: Request): string | null {
  const cookies = request.cookies as unknown;
  if (!cookies || typeof cookies !== 'object') return null;
  const values = cookies as Record<string, unknown>;
  const token = values['__Host-tv_access'] ?? values.tv_access;
  return typeof token === 'string' ? token : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => accessCookie(request),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    return { id: payload.sub, email: payload.email, sessionId: payload.sid };
  }
}
