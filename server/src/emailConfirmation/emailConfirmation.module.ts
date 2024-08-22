import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { EmailModule } from '../email/email.module'
import { UsersModule } from '../users/users.module'
import { EmailConfirmationController } from './emailConfirmation.controller'
import { EmailConfirmationService } from './emailConfirmation.service'

@Module({
  imports: [
    ConfigModule,
    EmailModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        service: configService.get('EMAIL_SERVICE'),
        user: configService.get('EMAIL_USER'),
        password: configService.get('EMAIL_PASSWORD'),
      }),
    }),
    JwtModule.register({}),
    UsersModule,
  ],
  providers: [EmailConfirmationService],
  exports: [EmailConfirmationService],
  controllers: [EmailConfirmationController],
})
export class EmailConfirmationModule {}
