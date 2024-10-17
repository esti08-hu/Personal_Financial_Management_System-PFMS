import { Module } from '@nestjs/common'
import { PasswordService } from 'src/auth/services/password.service'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  providers: [UsersService, PasswordService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
