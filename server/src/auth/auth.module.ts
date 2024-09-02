import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { UsersModule } from 'src/users/users.module'
import { AuthService } from './services/auth.service'
import 'dotenv/config'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { EmailModule } from 'src/email/email.module' // Import EmailModule
import { EmailConfirmationModule } from 'src/emailConfirmation/emailConfirmation.module'
import { AuthController } from './controllers/auth.controller'
import { PasswordController } from './controllers/password.controller'
import { AuthGuard } from './guards/auth.guard'
import { JwtStrategy } from './guards/jwt.strategy'
import { PasswordService } from './services/password.service'

@Module({
  imports: [
    UsersModule,
    EmailConfirmationModule,

    EmailModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        service: configService.get('EMAIL_SERVICE'),
        user: configService.get('EMAIL_USER'),
        password: configService.get('EMAIL_PASSWORD'),
      }),
    }),

    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    }),
  ],
  providers: [
    PasswordService,
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [AuthController, PasswordController],
  exports: [AuthService],
})
export class AuthModule {}
