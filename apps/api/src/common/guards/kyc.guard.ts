import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { REQUIRE_KYC_KEY } from '../decorators/require-kyc.decorator';
import { KycStatus } from '../enums';
import type { JwtUser } from '../types';

/**
 * Enforces `@RequireKyc()` routes: the user must have an approved identity
 * verification (Shahkar). Status is read from the DB — not the JWT — because
 * KYC state changes after tokens are issued.
 */
@Injectable()
export class KycGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_KYC_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required) return true;

    const { user } = context.switchToHttp().getRequest<{ user?: JwtUser }>();
    // Authentication itself is JwtAuthGuard's job.
    if (!user?.sub) return false;

    const dbUser = await this.userModel
      .findById(user.sub)
      .select('kycStatus')
      .lean();
    const kycStatus = dbUser?.kycStatus ?? KycStatus.NONE;

    if (kycStatus !== KycStatus.APPROVED) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        code: 'KYC_REQUIRED',
        kycStatus,
        message: 'برای انجام این عملیات ابتدا باید احراز هویت کنید',
      });
    }
    return true;
  }
}
