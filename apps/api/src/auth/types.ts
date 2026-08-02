import { Role } from '../generated/prisma/client';

export interface JwtPayload {
  sub: string;
  roles: Role[];
}

export interface JwtUser {
  id: string;
  roles: Role[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
