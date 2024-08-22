import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { PERMISSIONS_KEY } from './permissions.decorators'
import { Permission, ROLE_PERMISSION_ASSOCIATION, Role } from './role.emum'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    )
    if (!requiredPermissions) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const { user } = request
    const allUserPermissions = this.getUserPermissions(user.roles)
    request.allUserPermissions = allUserPermissions
    console.log('PermissionsGuard is working!')
    return requiredPermissions.some((permission) =>
      allUserPermissions?.includes(permission),
    )
  }

  private getUserPermissions(userRoles: Role[]) {
    const permissionSet = new Set()

    userRoles.forEach((userRole) => {
      const roleObject = ROLE_PERMISSION_ASSOCIATION.find(
        (role) => role.role === userRole,
      )
      if (roleObject) {
        roleObject.permissions.forEach((permission) =>
          permissionSet.add(permission),
        )
      }
    })
    return Array.from(permissionSet)
  }
}
