import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import 'dotenv/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { PasswordService } from './services/password.service';
import { JwtStrategy } from './guards/jwt.strategy';
import { EmailConfirmationModule } from 'src/emailConfirmation/emailConfirmation.module';

@Module({
  imports: [
    UsersModule,
    EmailConfirmationModule,
    JwtModule.register({
      global: true, // Makes the JwtModule available globally
      secret: process.env.JWT_ACCESS_TOKEN_SECRET, // Use the secret from the environment variable }, // Token expiration time
    }),
  ],
  providers: [
    PasswordService,
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: AuthGuard, // Apply AuthGuard globally to the application
    },
  ],
  controllers: [AuthController],
  exports: [AuthService], // Export AuthService for use in other modules
})
export class AuthModule {}
