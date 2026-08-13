import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import Joi from 'joi';
import { AccessCodesModule } from './access-codes/access-codes.module';
import { ApiTokensModule } from './api-tokens/api-tokens.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { GuestsModule } from './guests/guests.module';
import { InvitationsModule } from './invitations/invitations.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { MailModule } from './mail/mail.module';
import { MembersModule } from './members/members.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .default('development'),
        PORT: Joi.number().default(3000),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().port().default(3306),
        DB_NAME: Joi.string().required(),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().allow('').default(''),
        FRONTEND_ORIGIN: Joi.string().uri().default('http://localhost:5173'),
        JWT_ACCESS_SECRET: Joi.string().min(32).required(),
        ACCESS_CODE_PEPPER: Joi.string().min(16).required(),
        API_TOKEN_PEPPER: Joi.string().min(32).required(),
        COOKIE_SECURE: Joi.boolean().when('NODE_ENV', {
          is: 'production',
          then: Joi.valid(true).required(),
          otherwise: Joi.boolean().default(false),
        }),
        GOOGLE_CLIENT_ID: Joi.string().allow('').default(''),
        SMTP_HOST: Joi.string().allow('').default(''),
        SMTP_PORT: Joi.number().default(587),
        SMTP_SECURE: Joi.boolean().default(false),
        SMTP_USER: Joi.string().allow('').default(''),
        SMTP_PASS: Joi.string().allow('').default(''),
        SMTP_FROM: Joi.string().default('Treenvite <no-reply@treenvite.local>'),
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.getOrThrow<string>('DB_HOST'),
        port: config.getOrThrow<number>('DB_PORT'),
        database: config.getOrThrow<string>('DB_NAME'),
        username: config.getOrThrow<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD', ''),
        autoLoadEntities: true,
        synchronize: true,
        charset: 'utf8mb4',
        timezone: 'Z',
      }),
    }),
    MailModule,
    AuthModule,
    UsersModule,
    EventsModule,
    MembersModule,
    InvitationsModule,
    AccessCodesModule,
    GuestsModule,
    ApiTokensModule,
    IntegrationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
