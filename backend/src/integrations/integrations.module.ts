import { Module } from '@nestjs/common';
import { ApiTokensModule } from '../api-tokens/api-tokens.module';
import { GuestsModule } from '../guests/guests.module';
import { IntegrationsGuestsController } from './integrations-guests.controller';

@Module({
  imports: [ApiTokensModule, GuestsModule],
  controllers: [IntegrationsGuestsController],
})
export class IntegrationsModule {}
