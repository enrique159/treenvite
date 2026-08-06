import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from '../events/events.module';
import { AccessCodesController } from './access-codes.controller';
import { AccessCodesService } from './access-codes.service';
import { EventAccessCode } from './entities/event-access-code.entity';
import { EventAccessGrant } from './entities/event-access-grant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventAccessCode, EventAccessGrant]), EventsModule],
  controllers: [AccessCodesController],
  providers: [AccessCodesService],
})
export class AccessCodesModule {}
