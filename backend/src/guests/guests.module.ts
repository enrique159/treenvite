import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../events/events.module';
import { Guest } from './entities/guest.entity';
import { RelationSuggestion } from './entities/relation-suggestion.entity';
import { GuestsController } from './guests.controller';
import { GuestsService } from './guests.service';
import { RelationSuggestionsService } from './relation-suggestions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Guest, RelationSuggestion]),
    AuthModule,
    EventsModule,
  ],
  controllers: [GuestsController],
  providers: [GuestsService, RelationSuggestionsService],
  exports: [GuestsService],
})
export class GuestsModule {}
