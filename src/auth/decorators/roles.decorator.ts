import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../../common/constants/constants.js';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
