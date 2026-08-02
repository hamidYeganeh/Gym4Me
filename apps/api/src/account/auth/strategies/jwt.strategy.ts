import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserStatus } from '../../../common/enums';
import type { JwtUser } from '../../../common/types';
import { User, UserDocument } from '../../../schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtUser & { type?: string }): Promise<JwtUser> {
    if (payload.type) {
      // Single-purpose tokens (e.g. pwd_reset) are not valid for API auth.
      throw new UnauthorizedException();
    }

    // Live status check so blocking a user takes effect immediately.
    const user = await this.userModel
      .findById(payload.sub)
      .select('status roles phone')
      .lean();
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException();
    }

    return { sub: payload.sub, phone: user.phone, roles: user.roles };
  }
}
