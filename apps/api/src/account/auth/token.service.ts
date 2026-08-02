import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

  async issuePair(user: UserDocument): Promise<TokenPair> {
    const payload: JwtUser = {
      sub: user._id.toString(),
      phone: user.phone,
      roles: user.roles,
    };
    const accessToken = await this.jwt.signAsync(payload);

    const refreshToken = randomToken();
    await this.refreshModel.create({
      userId: user._id,
      tokenHash: sha256(refreshToken),
      expiresAt: new Date(Date.now() + this.refreshTtlMs()),
    });

    return { accessToken, refreshToken };
  }

  /** Rotates the refresh token; detects reuse and kills the whole session family. */
  async rotate(
    user: UserDocument,
    presentedToken: string,
  ): Promise<TokenPair> {
    const doc = await this.findValidToken(presentedToken);
    const pair = await this.issuePair(user);
    doc.revokedAt = new Date();
    doc.replacedByHash = sha256(pair.refreshToken);
    await doc.save();
    return pair;
  }

  /** Resolves the userId of a presented refresh token (for the refresh flow). */
  async resolveUserId(presentedToken: string): Promise<Types.ObjectId> {
    const doc = await this.findValidToken(presentedToken);
    return doc.userId;
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
      // Reuse of a rotated/revoked token — revoke everything for this user.
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

  async signPasswordResetToken(userId: string): Promise<string> {
    const payload: PasswordResetTokenPayload = {
      sub: userId,
      type: 'pwd_reset',
    };
    return this.jwt.signAsync(payload, { expiresIn: '10m' });
  }

  async verifyPasswordResetToken(token: string): Promise<string> {
    try {
      const payload =
        await this.jwt.verifyAsync<PasswordResetTokenPayload>(token);
      if (payload.type !== 'pwd_reset') throw new Error('wrong type');
      return payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }
}
