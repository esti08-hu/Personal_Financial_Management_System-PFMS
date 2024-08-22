import { SetMetadata } from '@nestjs/common'
import { Role } from 'src/permissions/role.emum'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles)

export const PERMISSIONS_KEY = 'permissions'
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions)
