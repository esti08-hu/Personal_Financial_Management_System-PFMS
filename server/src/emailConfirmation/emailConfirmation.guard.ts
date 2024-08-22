import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

@Injectable()
export class EmailConfirmationGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()

    if (!request.user?.isEmailConfirmed) {
      throw new UnauthorizedException('confirm you email first')
    }

    return true
  }
}
