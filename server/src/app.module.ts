import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { DatabaseModule } from './database/database.module'
import { UsersModule } from './users/users.module'
import 'dotenv/config'
import * as Joi from '@hapi/joi'
import { AccountModule } from './account/account.module'
import { BudgetModule } from './budget/budget.module'
import { EmailConfirmationModule } from './emailConfirmation/emailConfirmation.module'
import { GoogleAuthenticationModule } from './googleAuth/googleAuth.module'
import { PermissionsModule } from './permissions/permissions.module'
import { TransactionModule } from './transaction/transaction.module'
import { AiModule } from './ai'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.number().integer().required(),
        CORS_ORIGINS: Joi.string().default('http://localhost:3000'),

        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().integer().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),

        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.number().integer().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.number().integer().required(),

        EMAIL_SERVICE: Joi.string().required(),
        EMAIL_USER: Joi.string().required(),
        EMAIL_PASSWORD: Joi.string().required(),

        HUNTER_API_KEY: Joi.string().required(),

        EMAIL_VERIFICATION_SECRET: Joi.string().required(),
        EMAIL_VERIFICATION_SECRET_EXPIRATION: Joi.number().integer().required(),
        EMAIL_CONFIRMATION_URL: Joi.string().required(),

        GOOGLE_AUTH_CLIENT_ID: Joi.string().required(),
        GOOGLE_AUTH_CLIENT_SECRET: Joi.string().required(),

        GEMINI_API_KEY: Joi.string().required(),
        GEMINI_MODEL: Joi.string().required(),

        GOOGLE_API_KEY: Joi.string().required(),
      }),
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    EmailConfirmationModule,
    GoogleAuthenticationModule,
    PermissionsModule,
    TransactionModule,
    AccountModule,
    BudgetModule,
    AiModule,
    DatabaseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        user: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
