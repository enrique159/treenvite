import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CsrfGuard } from './csrf.guard';
import { AuthIdentity } from './entities/auth-identity.entity';
import { AuthToken } from './entities/auth-token.entity';
import { RefreshSession } from './entities/refresh-session.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AuthIdentity, AuthToken, RefreshSession]),
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, CsrfGuard],
  exports: [JwtAuthGuard, CsrfGuard, TypeOrmModule],
})
export class AuthModule {}
