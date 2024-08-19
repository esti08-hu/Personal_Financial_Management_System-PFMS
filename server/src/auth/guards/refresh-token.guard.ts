import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Role } from 'src/permissions/role.emum';

@Injectable()
export class JwtRefreshTokenGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user }: { user: { pid: string; roles: Role[] } } = request;

    if (!user) throw new UnauthorizedException('User not found');

    const refreshToken = request.cookies?.refresh_token;

    if (!refreshToken)
      throw new UnauthorizedException("Refresh token doesn't exist");
    await this.authService.validateRefreshToken(
      user.pid,
      refreshToken,
      user.roles,
    );
    console.log('JwtRefreshTokenGuard is working');
    return true;
  }
}
