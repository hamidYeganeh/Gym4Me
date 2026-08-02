import type { Role } from './enums';

export interface JwtUser {
  sub: string;
  phone: string;
  roles: Role[];
}

export interface PasswordResetTokenPayload {
  sub: string;
  type: 'pwd_reset';
}
