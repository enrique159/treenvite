import { MODULE_METADATA } from '@nestjs/common/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessCodesModule } from '../access-codes/access-codes.module';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../events/events.module';
import { GuestsModule } from '../guests/guests.module';
import { InvitationsModule } from '../invitations/invitations.module';
import { MembersModule } from '../members/members.module';
import { UsersModule } from '../users/users.module';

describe('protected module wiring', () => {
  it.each([
    UsersModule,
    EventsModule,
    MembersModule,
    InvitationsModule,
    AccessCodesModule,
    GuestsModule,
  ])(
    '%s imports AuthModule so authentication guards can resolve dependencies',
    (moduleType) => {
      const imports = Reflect.getMetadata(
        MODULE_METADATA.IMPORTS,
        moduleType,
      ) as unknown[];

      expect(imports).toContain(AuthModule);
    },
  );

  it('exports TypeORM repositories required by guards in importing modules', () => {
    const exports = Reflect.getMetadata(
      MODULE_METADATA.EXPORTS,
      AuthModule,
    ) as unknown[];

    expect(exports).toContain(TypeOrmModule);
  });
});
