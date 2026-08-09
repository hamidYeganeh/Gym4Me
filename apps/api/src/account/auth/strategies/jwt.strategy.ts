import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role, UserStatus } from '../../../common/enums';
import type { JwtUser } from '../../../common/types';
import { User, UserDocument } from '../../../schemas/user.schema';
import { TokenService } from '../token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly tokens: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      algorithms: ['HS256'],
    });
  }

  async validate(
    payload: JwtUser & { type?: string; iat?: number },
  ): Promise<JwtUser> {
    if (payload.type) {
      // Single-purpose tokens (e.g. pwd_reset) are not valid for API auth.
      throw new UnauthorizedException();
    }

    if (!payload.activeRole) {
      throw new UnauthorizedException('Missing active role');
    }

    await this.tokens.assertAccessNotRevoked(payload.sub, payload.iat);

    // Live status check so blocking a user takes effect immediately.
    const user = await this.userModel
      .findById(payload.sub)
      .select('status roles phone')
      .lean();
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException();
    }

    const roles = user.roles as Role[];
    if (!roles.includes(payload.activeRole)) {
      // Do not silently remapping — role was revoked or token is stale.
      throw new UnauthorizedException('Active role is no longer assigned');
    }

    return {
      sub: payload.sub,
      phone: user.phone,
      roles,
      activeRole: payload.activeRole,
    };
  }
}
