import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Request,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { IS_PUBLIC_KEY } from './auth.decorators'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = await this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getClass(), context.getHandler()],
    )
    if (isPublic) {
      return true
    }
    const request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromCookies(request)

    if (!token) {
      throw new UnauthorizedException('Token not found')
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      })
      request['user'] = payload
    } catch {
      throw new UnauthorizedException('Invalid token')
    }
    console.log('AuthGuard is working!')
    return true
  }

  private extractTokenFromCookies(@Request() req): string | undefined {
    return req.cookies?.access_token
  }
}
