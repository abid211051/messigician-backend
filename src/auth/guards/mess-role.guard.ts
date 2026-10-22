import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { MESS_ROLE_KEY } from '../decorators/mess-role.decorator.js';
import type { IGoogleUserPayload } from '../auth.types.js';

@Injectable()
export class MessRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.getAllAndOverride<string[]>(
      MESS_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!allowedRoles?.length) {
      throw new ForbiddenException('No roles configured for this route');
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: IGoogleUserPayload }>();

    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (!allowedRoles.includes(user.mess_role ?? '')) {
      throw new ForbiddenException('Forbidden');
    }

    return true;
  }
}
