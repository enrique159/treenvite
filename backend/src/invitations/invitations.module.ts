import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Event } from '../events/entities/event.entity';
import { EventsModule } from '../events/events.module';
import { EventMember } from '../members/entities/event-member.entity';
import { User } from '../users/entities/user.entity';
import { EventInvitation } from './entities/event-invitation.entity';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventInvitation, EventMember, Event, User]),
    AuthModule,
    EventsModule,
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
})
export class InvitationsModule {}
