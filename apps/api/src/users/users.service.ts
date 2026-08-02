import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import { AuditService } from '../audit/audit.service';
import { AuditAction, InviteStatus, Role } from '../common/enums';
import { buildReferralCode, buildUserCode } from '../common/utils/slug.util';
import { Invite, InviteDocument } from '../schemas/invite.schema';
import { User, UserDocument } from '../schemas/user.schema';

export interface CreateUserInput {
  phone: string;
  firstName?: string;
  lastName?: string;
  roles?: Role[];
  password?: string;
  referralCode?: string;
  phoneVerified?: boolean;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Invite.name)
    private readonly inviteModel: Model<InviteDocument>,
    private readonly audit: AuditService,
  ) {}

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByPhone(phone: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phone });
  }

  async findByCode(code: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ code: code.toLowerCase() });
  }

  async findByReferralCode(referralCode: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      referralCode: referralCode.toUpperCase(),
    });
  }

  async create(input: CreateUserInput): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ phone: input.phone });
    if (existing) throw new ConflictException('Phone already registered');

    const referrer = input.referralCode
      ? await this.userModel.findOne({
          referralCode: input.referralCode.toUpperCase(),
        })
      : null;

    const user = await this.createWithUniqueCodes({
      phone: input.phone,
      firstName: input.firstName,
      lastName: input.lastName,
      roles: input.roles?.length ? input.roles : [Role.ATHLETE],
      passwordHash: input.password
        ? await argon2.hash(input.password)
        : undefined,
      referredBy: referrer?._id,
      phoneVerifiedAt: input.phoneVerified ? new Date() : undefined,
    });

    if (referrer) {
      await this.inviteModel.updateOne(
        { inviterId: referrer._id, phone: user.phone },
        { status: InviteStatus.JOINED, joinedUserId: user._id },
      );
      this.audit.log({
        action: AuditAction.REFERRAL_JOINED,
        actorId: user._id,
        targetUserId: referrer._id,
        metadata: { referralCode: referrer.referralCode },
      });
    }

    return user;
  }

  /**
   * `code` and `referralCode` have unique indexes; the random suffixes make
   * collisions rare, so a couple of retries is plenty.
   */
  private async createWithUniqueCodes(
    doc: Partial<User>,
    attempt = 0,
  ): Promise<UserDocument> {
    try {
      return await this.userModel.create({
        ...doc,
        code: buildUserCode(doc.firstName, doc.lastName),
        referralCode: buildReferralCode(doc.firstName),
      });
    } catch (err: unknown) {
      const isDupCode =
        typeof err === 'object' &&
        err !== null &&
        (err as { code?: number }).code === 11000 &&
        ['code', 'referralCode'].some((key) =>
          Object.keys(
            (err as { keyPattern?: Record<string, unknown> }).keyPattern ?? {},
          ).includes(key),
        );
      if (isDupCode && attempt < 3) {
        return this.createWithUniqueCodes(doc, attempt + 1);
      }
      throw err;
    }
  }

  /** Regenerate the auto handle when names arrive, unless already name-based. */
  async refreshCodeIfAuto(user: UserDocument): Promise<void> {
    if (user.code?.startsWith('user-') && (user.firstName || user.lastName)) {
      user.code = buildUserCode(user.firstName, user.lastName);
      await user.save();
    }
  }

  toPublic(user: UserDocument) {
    return {
      id: user._id.toString(),
      phone: user.phone,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      nationalId: user.nationalId ?? null,
      roles: user.roles,
      code: user.code ?? null,
      referralCode: user.referralCode ?? null,
      status: user.status,
      kycStatus: user.kycStatus,
      phoneVerifiedAt: user.phoneVerifiedAt ?? null,
      createdAt: user.createdAt,
    };
  }
}
