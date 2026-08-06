import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventAccessGrant } from '../access-codes/entities/event-access-grant.entity';
import { EventAccessCode } from '../access-codes/entities/event-access-code.entity';
import { AuthModule } from '../auth/auth.module';
import { AuthIdentity } from '../auth/entities/auth-identity.entity';
import { AuthToken } from '../auth/entities/auth-token.entity';
import { RefreshSession } from '../auth/entities/refresh-session.entity';
import { Event } from '../events/entities/event.entity';
import { Guest } from '../guests/entities/guest.entity';
import { EventInvitation } from '../invitations/entities/event-invitation.entity';
import { EventMember } from '../members/entities/event-member.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      AuthIdentity,
      AuthToken,
      RefreshSession,
      Event,
      Guest,
      EventMember,
      EventInvitation,
      EventAccessCode,
      EventAccessGrant,
    ]),
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
