import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Role } from 'src/permissions/role.emum'
import { ROLES_KEY } from './permissions.decorators'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRoles) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()
    if (!user) {
      console.log("user doesn't exist")
      return false
    }
    console.log('RolesGuard is working!')
    return requiredRoles.some((role) => user.roles?.includes(role))
  }
}
