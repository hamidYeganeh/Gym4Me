import { ForbiddenException } from '@nestjs/common';
import type { Role } from '../enums';
import type { JwtUser } from '../types';

export function assertHasRole(user: JwtUser, role: Role): void {
  if (!user.roles.includes(role)) {
    throw new ForbiddenException(`You don't have the "${role}" role`);
  }
}

export function assertActiveRole(user: JwtUser, role: Role): void {
  if (user.activeRole !== role) {
    throw new ForbiddenException(
      `This action requires activeRole="${role}" (current: "${user.activeRole}")`,
    );
  }
}

/** Membership required to read own role profile; activeRole required to mutate. */
export function assertCanMutateAsRole(user: JwtUser, role: Role): void {
  assertHasRole(user, role);
  assertActiveRole(user, role);
}
