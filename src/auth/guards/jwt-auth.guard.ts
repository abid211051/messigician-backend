import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth.service.js';
import type { IGoogleUserPayload } from '../auth.types.js';
import { ACCESS_TOKEN_COOKIE } from '../auth.constants.js';

type AuthenticatedRequest = Request & {
  cookies?: Record<string, string>;
  user?: IGoogleUserPayload;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = request.cookies?.[ACCESS_TOKEN_COOKIE];

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    request.user = await this.authService.verifyAccessToken(token);

    return true;
  }
}
