import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from '../events/events.module';
import { Guest } from './entities/guest.entity';
import { GuestsController } from './guests.controller';
import { GuestsService } from './guests.service';

@Module({ imports: [TypeOrmModule.forFeature([Guest]), EventsModule], controllers: [GuestsController], providers: [GuestsService] })
export class GuestsModule {}
