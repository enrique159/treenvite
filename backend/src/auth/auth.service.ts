import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { OAuth2Client } from 'google-auth-library';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { ApiException } from '../common/api-exception';
import { AuthProvider, AuthTokenType } from '../common/domain.enums';
import { randomToken, sha256 } from '../common/hash.util';
import { MailService } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';
import {
  EmailDto,
  GoogleAuthDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  TokenDto,
} from './dto/auth.dto';
import { AuthIdentity } from './entities/auth-identity.entity';
import { AuthToken } from './entities/auth-token.entity';
import { RefreshSession } from './entities/refresh-session.entity';

export interface SessionResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly google: OAuth2Client;

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(AuthIdentity)
    private readonly identities: Repository<AuthIdentity>,
    @InjectRepository(RefreshSession)
    private readonly sessions: Repository<RefreshSession>,
    @InjectRepository(AuthToken)
    private readonly authTokens: Repository<AuthToken>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {
    this.google = new OAuth2Client(config.get<string>('GOOGLE_CLIENT_ID'));
  }

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const email = dto.email.trim().toLowerCase();
    if (await this.users.exists({ where: { email } })) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'EMAIL_ALREADY_EXISTS',
        'Ya existe una cuenta con este correo',
      );
    }

    const user = await this.users.save(
      this.users.create({
        name: dto.name.trim(),
        email,
        avatarUrl: null,
        emailVerifiedAt: null,
      }),
    );
    await this.identities.save(
      this.identities.create({
        provider: AuthProvider.LOCAL,
        providerSubject: email,
        passwordHash: await argon2.hash(dto.password),
        userId: user.id,
      }),
    );
    await this.createAndSendToken(user, AuthTokenType.VERIFY_EMAIL);
    return { message: 'Revisa tu correo para confirmar la cuenta' };
  }

  async login(
    dto: LoginDto,
    meta: { userAgent?: string; ip?: string },
  ): Promise<SessionResult> {
    const email = dto.email.trim().toLowerCase();
    const identity = await this.identities
      .createQueryBuilder('identity')
      .addSelect('identity.passwordHash')
      .innerJoinAndSelect('identity.user', 'user')
      .where('identity.provider = :provider', { provider: AuthProvider.LOCAL })
      .andWhere('identity.providerSubject = :email', { email })
      .getOne();

    if (
      !identity?.passwordHash ||
      !(await argon2.verify(identity.passwordHash, dto.password))
    ) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'INVALID_CREDENTIALS',
        'Correo o contraseña incorrectos',
      );
    }
    if (!identity.user.emailVerifiedAt) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'EMAIL_NOT_VERIFIED',
        'Confirma tu correo antes de entrar',
      );
    }
    return this.createSession(identity.user, meta);
  }

  async googleLogin(
    dto: GoogleAuthDto,
    meta: { userAgent?: string; ip?: string },
  ): Promise<SessionResult> {
    const clientId = this.config.getOrThrow<string>('GOOGLE_CLIENT_ID');
    const ticket = await this.google.verifyIdToken({
      idToken: dto.credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email || !payload.email_verified) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'INVALID_GOOGLE_ACCOUNT',
        'Google no confirmó esta cuenta',
      );
    }

    let identity = await this.identities.findOne({
      where: { provider: AuthProvider.GOOGLE, providerSubject: payload.sub },
      relations: { user: true },
    });
    if (!identity) {
      const email = payload.email.toLowerCase();
      let user = await this.users.findOne({ where: { email } });
      if (!user) {
        user = await this.users.save(
          this.users.create({
            email,
            name: payload.name ?? email.split('@')[0],
            avatarUrl: payload.picture ?? null,
            emailVerifiedAt: new Date(),
          }),
        );
      } else if (!user.emailVerifiedAt) {
        user.emailVerifiedAt = new Date();
        await this.users.save(user);
      }
      identity = await this.identities.save(
        this.identities.create({
          provider: AuthProvider.GOOGLE,
          providerSubject: payload.sub,
          passwordHash: null,
          userId: user.id,
          user,
        }),
      );
    }
    return this.createSession(identity.user, meta);
  }

  async refresh(
    refreshToken: string | undefined,
    meta: { userAgent?: string; ip?: string },
  ): Promise<SessionResult> {
    if (!refreshToken)
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'SESSION_EXPIRED',
        'La sesión expiró',
      );
    const session = await this.sessions
      .createQueryBuilder('session')
      .addSelect('session.tokenHash')
      .innerJoinAndSelect('session.user', 'user')
      .where('session.tokenHash = :hash', { hash: sha256(refreshToken) })
      .andWhere('session.revokedAt IS NULL')
      .andWhere('session.expiresAt > :now', { now: new Date() })
      .getOne();
    if (!session)
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'SESSION_EXPIRED',
        'La sesión expiró',
      );

    session.revokedAt = new Date();
    await this.sessions.save(session);
    return this.createSession(session.user, meta);
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    await this.sessions.update(
      { tokenHash: sha256(refreshToken), revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  async createCsrf(sessionId: string): Promise<string> {
    const token = randomToken(24);
    await this.sessions.update(
      { id: sessionId, revokedAt: IsNull() },
      { csrfHash: sha256(token) },
    );
    return token;
  }

  async verifyEmail(dto: TokenDto): Promise<{ message: string }> {
    const token = await this.consumeToken(
      dto.token,
      AuthTokenType.VERIFY_EMAIL,
    );
    await this.users.update(token.userId, { emailVerifiedAt: new Date() });
    return { message: 'Correo confirmado' };
  }

  async resendVerification(dto: EmailDto): Promise<{ message: string }> {
    const user = await this.users.findOne({
      where: { email: dto.email.trim().toLowerCase() },
    });
    if (user && !user.emailVerifiedAt)
      await this.createAndSendToken(user, AuthTokenType.VERIFY_EMAIL);
    return { message: 'Si la cuenta existe, recibirás un correo' };
  }

  async forgotPassword(dto: EmailDto): Promise<{ message: string }> {
    const user = await this.users.findOne({
      where: { email: dto.email.trim().toLowerCase() },
    });
    if (user) await this.createAndSendToken(user, AuthTokenType.RESET_PASSWORD);
    return { message: 'Si la cuenta existe, recibirás un correo' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const token = await this.consumeToken(
      dto.token,
      AuthTokenType.RESET_PASSWORD,
    );
    const identity = await this.identities.findOne({
      where: { userId: token.userId, provider: AuthProvider.LOCAL },
    });
    if (!identity)
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'LOCAL_IDENTITY_NOT_FOUND',
        'La cuenta no usa contraseña',
      );
    await this.identities.update(identity.id, {
      passwordHash: await argon2.hash(dto.password),
    });
    await this.sessions.update(
      { userId: token.userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
    return { message: 'Contraseña actualizada' };
  }

  async me(userId: string): Promise<User> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user)
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'USER_NOT_FOUND',
        'La cuenta ya no existe',
      );
    return user;
  }

  private async createSession(
    user: User,
    meta: { userAgent?: string; ip?: string },
  ): Promise<SessionResult> {
    const refreshToken = randomToken(48);
    const session = await this.sessions.save(
      this.sessions.create({
        userId: user.id,
        tokenHash: sha256(refreshToken),
        csrfHash: null,
        userAgent: meta.userAgent?.slice(0, 500) ?? null,
        ipAddress: meta.ip?.slice(0, 64) ?? null,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        revokedAt: null,
      }),
    );
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, sid: session.id },
      {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      },
    );
    return { user, accessToken, refreshToken };
  }

  private async createAndSendToken(
    user: User,
    type: AuthTokenType,
  ): Promise<void> {
    const raw = randomToken(32);
    await this.authTokens.save(
      this.authTokens.create({
        tokenHash: sha256(raw),
        type,
        userId: user.id,
        usedAt: null,
        expiresAt: new Date(
          Date.now() +
            (type === AuthTokenType.VERIFY_EMAIL ? 24 : 1) * 60 * 60 * 1000,
        ),
      }),
    );
    if (type === AuthTokenType.VERIFY_EMAIL)
      await this.mail.sendVerification(user.email, user.name, raw);
    else await this.mail.sendPasswordReset(user.email, user.name, raw);
  }

  private async consumeToken(
    raw: string,
    type: AuthTokenType,
  ): Promise<AuthToken> {
    const token = await this.authTokens.findOne({
      where: {
        tokenHash: sha256(raw),
        type,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });
    if (!token)
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'TOKEN_INVALID',
        'El enlace es inválido o expiró',
      );
    token.usedAt = new Date();
    return this.authTokens.save(token);
  }
}
