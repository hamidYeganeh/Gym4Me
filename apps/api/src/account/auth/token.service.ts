import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role } from '../../common/enums';
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

/** Prefer athlete when present; otherwise first assigned role. */
export function pickDefaultActiveRole(roles: Role[]): Role {
  if (roles.includes(Role.ATHLETE)) return Role.ATHLETE;
  if (roles.includes(Role.ADMIN)) return Role.ADMIN;
  return roles[0] ?? Role.ATHLETE;
}

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshModel: Model<RefreshTokenDocument>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private refreshTtlMs(): number {
    const days = Number(this.config.get('JWT_REFRESH_TTL_DAYS', '30'));
    return days * 24 * 60 * 60 * 1000;
  }

  private passwordResetSecret(): string {
    return (
      this.config.get<string>('JWT_PASSWORD_RESET_SECRET') ??
      this.config.getOrThrow<string>('JWT_ACCESS_SECRET')
    );
  }

  async issuePair(
    user: UserDocument,
    activeRole?: Role,
  ): Promise<TokenPair> {
    const role = activeRole ?? pickDefaultActiveRole(user.roles);
    if (!user.roles.includes(role)) {
      throw new UnauthorizedException('Role not assigned to user');
    }

    const payload: JwtUser = {
      sub: user._id.toString(),
      phone: user.phone,
      roles: user.roles,
      activeRole: role,
    };
    const accessToken = await this.jwt.signAsync(payload);

    const refreshToken = randomToken();
    await this.refreshModel.create({
      userId: user._id,
      tokenHash: sha256(refreshToken),
      activeRole: role,
      expiresAt: new Date(Date.now() + this.refreshTtlMs()),
    });

    return { accessToken, refreshToken };
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

    const pair = await this.issuePair(user, role);
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
    const pair = await this.issuePair(user, nextRole);
    if (presentedRefreshToken) {
      await this.revoke(presentedRefreshToken);
    }
    return pair;
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
      await this.revokeAll(doc.userId);
      throw new UnauthorizedException('Refresh token reuse detected');
    }
    return doc;
  }

  async revoke(presentedToken: string): Promise<void> {
    await this.refreshModel.updateOne(
      { tokenHash: sha256(presentedToken), revokedAt: null },
      { revokedAt: new Date() },
    );
  }

  async revokeAll(userId: Types.ObjectId | string): Promise<void> {
    await this.refreshModel.updateMany(
      { userId, revokedAt: null },
      { revokedAt: new Date() },
    );
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
    const payload: PasswordResetTokenPayload = {
      sub: userId,
      type: 'pwd_reset',
    };
    return this.jwt.signAsync(payload, {
      secret: this.passwordResetSecret(),
      expiresIn: '10m',
    });
  }

  async verifyPasswordResetToken(token: string): Promise<string> {
    try {
      const payload =
        await this.jwt.verifyAsync<PasswordResetTokenPayload>(token, {
          secret: this.passwordResetSecret(),
        });
      if (payload.type !== 'pwd_reset') throw new Error('wrong type');
      return payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }
}
