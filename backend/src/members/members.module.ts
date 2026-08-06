import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../events/events.module';
import { EventMember } from './entities/event-member.entity';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

@Module({
  imports: [TypeOrmModule.forFeature([EventMember]), AuthModule, EventsModule],
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}
