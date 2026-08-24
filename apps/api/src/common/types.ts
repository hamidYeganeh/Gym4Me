import type { Role } from './enums';

export interface JwtUser {
  sub: string;
  phone: string;
  /** Stable id for one login/device session. */
  sessionId?: string;
  /** All roles the user holds — for UI switcher only. */
  roles: Role[];
  /** Role used for authorization on this session. */
  activeRole: Role;
  /** Present when an admin is acting as this user (M5). */
  impersonation?: { sessionId: string; adminId: string };
}

export interface PasswordResetTokenPayload {
  sub: string;
  type: 'pwd_reset';
  jti: string;
}
