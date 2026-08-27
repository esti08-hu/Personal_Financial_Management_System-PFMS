import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { PermissionsGuard } from './permissions.guard'
import { RolesGuard } from './roles.guard'
import { UsersService } from 'src/modules/users/users.service'

@Module({
  providers: [
    UsersService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  exports: [UsersService],
})
export class PermissionsModule {}
