import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuthRequest } from '../types/auth.type.js';
import { AUTH_CONSTANTS } from '../../common/constants/constants.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    const authorization = request.headers.authorization;
    const match =
      typeof authorization === 'string'
        ? authorization.match(/^Bearer\s+(\S+)$/i)
        : null;

    const token = match?.[1] ?? request.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    let payload: { sub: string; tokenType: string };

    try {
      payload = await this.jwt.verifyAsync(token, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        algorithms: ['HS256'],
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    if (
      payload.tokenType !== AUTH_CONSTANTS.ACCESS_TOKEN_TYPE ||
      !payload.sub
    ) {
      throw new UnauthorizedException('Invalid access token');
    }

    const user = await this.prisma.users.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.ban) {
      throw new UnauthorizedException('Account unavailable');
    }

    request.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      mess_role: user.mess_role,
      mess_id: user.mess_id,
      sub_mess_id: user.sub_mess_id,
    };

    return true;
  }
}
