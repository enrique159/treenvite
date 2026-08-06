import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../events/events.module';
import { Guest } from './entities/guest.entity';
import { GuestsController } from './guests.controller';
import { GuestsService } from './guests.service';

@Module({
  imports: [TypeOrmModule.forFeature([Guest]), AuthModule, EventsModule],
  controllers: [GuestsController],
  providers: [GuestsService],
})
export class GuestsModule {}
