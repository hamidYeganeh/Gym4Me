import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StaffService } from '../../account/staff/staff.service';
import {
  CLUB_ID_PARAM_KEY,
  STAFF_PERMISSION_KEY,
} from '../decorators/require-staff-permission.decorator';
import { Role, type StaffPermissionKey } from '../enums';
import type { JwtUser } from '../types';

/**
 * Resolves clubId from route params and asserts staff permission.
 * Club owners (by ownership) and CLUB_OWNER activeRole for their club pass
 * without a grant check; CLUB_STAFF must hold the required grant.
 */
@Injectable()
export class StaffPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly staff: StaffService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.getAllAndOverride<StaffPermissionKey>(
      STAFF_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!permission) return true;

    const paramName =
      this.reflector.getAllAndOverride<string>(CLUB_ID_PARAM_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'clubId';

    const request = context.switchToHttp().getRequest<{
      user?: JwtUser;
      params?: Record<string, string>;
    }>();
    const user = request.user;
    if (!user?.sub) {
      throw new ForbiddenException('Authentication required');
    }

    const clubId = request.params?.[paramName];
    if (!clubId) {
      throw new ForbiddenException(`Missing route param: ${paramName}`);
    }

    const access = await this.staff.requireClubAccess(user.sub, clubId);
    if (access.asOwner || user.activeRole === Role.CLUB_OWNER) {
      if (user.activeRole === Role.CLUB_OWNER && !access.asOwner) {
        throw new ForbiddenException('Not your club');
      }
      return true;
    }

    await this.staff.assertStaffPermission(clubId, user.sub, permission);
    return true;
  }
}
