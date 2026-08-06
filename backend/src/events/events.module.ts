import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventAccessGrant } from '../access-codes/entities/event-access-grant.entity';
import { AuthModule } from '../auth/auth.module';
import { EventMember } from '../members/entities/event-member.entity';
import { Event } from './entities/event.entity';
import { EventAccessService } from './event-access.service';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, EventMember, EventAccessGrant]),
    AuthModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, EventAccessService],
  exports: [EventAccessService],
})
export class EventsModule {}
