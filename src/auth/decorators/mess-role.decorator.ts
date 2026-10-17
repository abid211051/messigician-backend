import { SetMetadata } from '@nestjs/common';

export const MESS_ROLE_KEY = 'mess_role';

export const MessRole = (...roles: string[]) =>
  SetMetadata(MESS_ROLE_KEY, roles);
