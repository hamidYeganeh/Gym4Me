import { SetMetadata } from '@nestjs/common';
import type { StaffPermissionKey } from '../enums';

export const STAFF_PERMISSION_KEY = 'staffPermission';
export const CLUB_ID_PARAM_KEY = 'clubIdParam';

/**
 * Requires the caller to hold `key` for the club resolved from route params
 * (`clubId` by default). Owners always pass. Enforced by StaffPermissionGuard.
 */
export const RequireStaffPermission = (key: StaffPermissionKey) =>
  SetMetadata(STAFF_PERMISSION_KEY, key);

/** Override the route param name that holds clubId (default: `clubId`). */
export const ClubIdParam = (param = 'clubId') =>
  SetMetadata(CLUB_ID_PARAM_KEY, param);
