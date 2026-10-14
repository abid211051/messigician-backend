import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { MESS_ROLES_KEY, ROLES_KEY } from '../../common/constants/constants.js';

type AuthRequest = Request & {
  user?: {
    role: string;
    mess_role: string | null;
  };
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const messRoles = this.reflector.getAllAndOverride<string[]>(
      MESS_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!roles && !messRoles) return true;

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (roles && !roles.includes(user.role)) {
      throw new ForbiddenException('Insufficient system role');
    }

    if (messRoles && (!user.mess_role || !messRoles.includes(user.mess_role))) {
      throw new ForbiddenException('Insufficient mess role');
    }

    return true;
  }
}
