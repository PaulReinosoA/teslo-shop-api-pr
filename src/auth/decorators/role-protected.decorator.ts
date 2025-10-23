import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces/valid-roles.interfces';

export const META_ROLES = 'roles';

export const RoleProtected = (...args: ValidRoles[]) =>
  SetMetadata('roles', args);
