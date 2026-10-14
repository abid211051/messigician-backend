import { SetMetadata } from '@nestjs/common';
import { MESS_ROLES_KEY } from '../../common/constants/constants.js';

export const MessRoles = (...roles: string[]) =>
  SetMetadata(MESS_ROLES_KEY, roles);
