import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import type Redis from 'ioredis';
import { Model, Types } from 'mongoose';
import { Role } from '../../common/enums';
import { REDIS } from '../../common/redis/redis.module';
import type { JwtUser, PasswordResetTokenPayload } from '../../common/types';
import { randomToken, sha256 } from '../../common/utils/hash.util';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../../schemas/refresh-token.schema';
import { UserDocument } from '../../schemas/user.schema';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const ACCOUNT_ROLES: Role[] = [Role.ATHLETE, Role.COACH, Role.CLUB_OWNER];

/**
 * Prefer athlete when present; never pick admin for account (mobile) sessions.
 */
export function pickDefaultActiveRole(roles: Role[]): Role {
  for (const role of ACCOUNT_ROLES) {
    if (roles.includes(role)) return role;
  }
  throw new UnauthorizedException(
    'No account role available; use admin authentication',
  );
}

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshModel: Model<RefreshTokenDocument>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  private refreshTtlMs(): number {
    const days = Number(this.config.get('JWT_REFRESH_TTL_DAYS', '30'));
    return days * 24 * 60 * 60 * 1000;
  }

  private passwordResetSecret(): string {
    return this.config.getOrThrow<string>('JWT_PASSWORD_RESET_SECRET');
  }

  private sessionsRevokedKey(userId: string): string {
    return `auth:sessions_revoked:${userId}`;
  }

  private sessionRevokedKey(userId: string, sessionId: string): string {
    return `auth:session_revoked:${userId}:${sessionId}`;
  }

  async markSessionsRevoked(userId: Types.ObjectId | string): Promise<void> {
    const id = userId.toString();
    const accessTtl = this.config.get('JWT_ACCESS_TTL', '900s');
    const seconds = Math.max(this.parseTtlSeconds(accessTtl), 900);
    await this.redis.set(
      this.sessionsRevokedKey(id),
      String(Math.floor(Date.now() / 1000)),
      'EX',
      seconds,
    );
  }

  async assertAccessNotRevoked(
    userId: string,
    iat?: number,
    sessionId?: string,
  ): Promise<void> {
    if (iat == null) return;
    const [allRaw, sessionRaw] = await Promise.all([
      this.redis.get(this.sessionsRevokedKey(userId)),
      sessionId
        ? this.redis.get(this.sessionRevokedKey(userId, sessionId))
        : Promise.resolve(null),
    ]);
    const wasRevoked = [allRaw, sessionRaw].some((raw) => {
      if (!raw) return false;
      const revokedAt = Number(raw);
      return Number.isFinite(revokedAt) && iat <= revokedAt;
    });
    if (wasRevoked) {
      throw new UnauthorizedException('Session revoked');
    }
  }

  private parseTtlSeconds(ttl: string): number {
    const match = /^(\d+)([smhd])?$/.exec(ttl.trim());
    if (!match) return 900;
    const n = Number(match[1]);
    const unit = match[2] ?? 's';
    if (unit === 'm') return n * 60;
    if (unit === 'h') return n * 3600;
    if (unit === 'd') return n * 86400;
    return n;
  }

  async issuePair(
    user: UserDocument,
    activeRole?: Role,
    sessionId = randomToken(16),
  ): Promise<TokenPair> {
    const role = activeRole ?? pickDefaultActiveRole(user.roles);
    if (!user.roles.includes(role)) {
      throw new UnauthorizedException('Role not assigned to user');
    }

    const payload: JwtUser = {
      sub: user._id.toString(),
      phone: user.phone,
      sessionId,
      roles: user.roles,
      activeRole: role,
    };
    const accessToken = await this.jwt.signAsync(payload, {
      algorithm: 'HS256',
    });

    const refreshToken = randomToken();
    await this.refreshModel.create({
      userId: user._id,
      tokenHash: sha256(refreshToken),
      sessionId,
      activeRole: role,
      expiresAt: new Date(Date.now() + this.refreshTtlMs()),
    });

    return { accessToken, refreshToken };
  }

  /**
   * Short-lived access token for an admin acting as `user` (M5).
   * No refresh token — the admin restarts the session when it expires;
   * the JWT strategy also rejects it as soon as the session ends.
   */
  async issueImpersonationToken(
    user: UserDocument,
    impersonation: { sessionId: string; adminId: string },
  ): Promise<{ accessToken: string; expiresInSeconds: number }> {
    const role = pickDefaultActiveRole(user.roles);
    const payload: JwtUser = {
      sub: user._id.toString(),
      phone: user.phone,
      roles: user.roles,
      activeRole: role,
      impersonation,
    };
    const expiresInSeconds = 900;
    const accessToken = await this.jwt.signAsync(payload, {
      algorithm: 'HS256',
      expiresIn: `${expiresInSeconds}s`,
    });
    return { accessToken, expiresInSeconds };
  }

  /** Rotates the refresh token; detects reuse and kills the whole session family. */
  async rotate(
    user: UserDocument,
    presentedToken: string,
    forceActiveRole?: Role,
  ): Promise<TokenPair> {
    const doc = await this.findValidToken(presentedToken);

    let role: Role;
    if (forceActiveRole) {
      if (!user.roles.includes(forceActiveRole)) {
        throw new UnauthorizedException('Role not assigned to user');
      }
      role = forceActiveRole;
    } else if (doc.activeRole && user.roles.includes(doc.activeRole)) {
      role = doc.activeRole;
    } else {
      await this.revokeAll(user._id);
      throw new UnauthorizedException('Session role is no longer valid');
    }

    const sessionId = doc.sessionId ?? randomToken(16);
    const pair = await this.issuePair(user, role, sessionId);
    doc.revokedAt = new Date();
    doc.replacedByHash = sha256(pair.refreshToken);
    await doc.save();
    return pair;
  }

  /**
   * Issues a new pair for a different activeRole and revokes the current refresh token.
   */
  async switchRole(
    user: UserDocument,
    presentedRefreshToken: string | undefined,
    nextRole: Role,
  ): Promise<TokenPair> {
    if (!user.roles.includes(nextRole)) {
      throw new UnauthorizedException('Role not assigned to user');
    }
    if (nextRole === Role.ADMIN) {
      throw new UnauthorizedException(
        'Admin role cannot be activated via account auth',
      );
    }
    if (presentedRefreshToken) {
      return this.rotate(user, presentedRefreshToken, nextRole);
    }
    return this.issuePair(user, nextRole);
  }

  async resolveUserId(presentedToken: string): Promise<Types.ObjectId> {
    const doc = await this.findValidToken(presentedToken);
    return doc.userId;
  }

  async resolveActiveRole(presentedToken: string): Promise<Role | undefined> {
    const doc = await this.findValidToken(presentedToken);
    return doc.activeRole;
  }

  private async findValidToken(
    presentedToken: string,
  ): Promise<RefreshTokenDocument> {
    const doc = await this.refreshModel.findOne({
      tokenHash: sha256(presentedToken),
    });
    if (!doc || doc.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (doc.revokedAt) {
      await this.revokeSession(doc);
      throw new UnauthorizedException('Refresh token reuse detected');
    }
    return doc;
  }

  async revoke(presentedToken: string): Promise<void> {
    const doc = await this.refreshModel.findOne({
      tokenHash: sha256(presentedToken),
    });
    if (!doc) return;
    await this.revokeSession(doc);
  }

  private async revokeSession(doc: RefreshTokenDocument): Promise<void> {
    const now = new Date();
    if (doc.sessionId) {
      await this.refreshModel.updateMany(
        { userId: doc.userId, sessionId: doc.sessionId, revokedAt: null },
        { revokedAt: now },
      );
      await this.markSessionRevoked(doc.userId, doc.sessionId, now);
      return;
    }

    // Legacy tokens predate session ids. Revoke only their rotation chain so
    // a stale token from one device cannot sign every other device out.
    let tokenHash: string | undefined = doc.tokenHash;
    while (tokenHash) {
      const current = await this.refreshModel.findOne({ tokenHash });
      if (!current) break;
      if (current.sessionId) {
        await this.refreshModel.updateMany(
          {
            userId: current.userId,
            sessionId: current.sessionId,
            revokedAt: null,
          },
          { revokedAt: now },
        );
        await this.markSessionRevoked(current.userId, current.sessionId, now);
        break;
      }
      if (!current.revokedAt) {
        current.revokedAt = now;
        await current.save();
      }
      tokenHash = current.replacedByHash;
    }
  }

  private async markSessionRevoked(
    userId: Types.ObjectId,
    sessionId: string,
    revokedAt: Date,
  ): Promise<void> {
    const accessTtl = this.config.get('JWT_ACCESS_TTL', '900s');
    await this.redis.set(
      this.sessionRevokedKey(userId.toString(), sessionId),
      String(Math.floor(revokedAt.getTime() / 1000)),
      'EX',
      Math.max(this.parseTtlSeconds(accessTtl), 900),
    );
  }

  async revokeAll(userId: Types.ObjectId | string): Promise<void> {
    await this.refreshModel.updateMany(
      { userId, revokedAt: null },
      { revokedAt: new Date() },
    );
    await this.markSessionsRevoked(userId);
  }

  /** Revoke sessions whose activeRole is no longer in the user's roles. */
  async revokeInvalidRoleSessions(
    userId: Types.ObjectId | string,
    roles: Role[],
  ): Promise<void> {
    await this.refreshModel.updateMany(
      {
        userId,
        revokedAt: null,
        activeRole: { $nin: roles },
      },
      { revokedAt: new Date() },
    );
  }

  async signPasswordResetToken(userId: string): Promise<string> {
    const jti = randomToken(16);
    await this.redis.set(`pwd_reset:${jti}`, userId, 'EX', 600);
    const payload: PasswordResetTokenPayload = {
      sub: userId,
      type: 'pwd_reset',
      jti,
    };
    return this.jwt.signAsync(payload, {
      secret: this.passwordResetSecret(),
      expiresIn: '10m',
      algorithm: 'HS256',
    });
  }

  async verifyPasswordResetToken(token: string): Promise<string> {
    try {
      const payload = await this.jwt.verifyAsync<PasswordResetTokenPayload>(
        token,
        {
          secret: this.passwordResetSecret(),
          algorithms: ['HS256'],
        },
      );
      if (payload.type !== 'pwd_reset' || !payload.jti) {
        throw new Error('wrong type');
      }
      const key = `pwd_reset:${payload.jti}`;
      const stored = await this.redis.get(key);
      if (!stored || stored !== payload.sub) {
        throw new Error('already used or missing');
      }
      await this.redis.del(key);
      return payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }
}
