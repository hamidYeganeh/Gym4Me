import type { Role } from './enums';

export interface JwtUser {
  sub: string;
  phone: string;
  /** All roles the user holds — for UI switcher only. */
  roles: Role[];
  /** Role used for authorization on this session. */
  activeRole: Role;
}

export interface PasswordResetTokenPayload {
  sub: string;
  type: 'pwd_reset';
}
