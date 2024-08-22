import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from 'src/auth/auth.module'
import { UsersModule } from 'src/users/users.module'
import { GoogleAuthenticationController } from './googleAuth.controller'
import { GoogleAuthenticationService } from './googleAuth.service'

@Module({
  imports: [ConfigModule, UsersModule, AuthModule],
  providers: [GoogleAuthenticationService],
  controllers: [GoogleAuthenticationController],
  exports: [],
})
export class GoogleAuthenticationModule {}
