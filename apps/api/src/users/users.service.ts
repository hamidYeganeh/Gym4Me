import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as argon2 from 'argon2';
import { AuditService } from '../audit/audit.service';
import { AuditAction, InviteStatus, Role } from '../common/enums';
import { buildReferralCode, buildUserCode } from '../common/utils/slug.util';
import { createSearchFilter } from '../common/utils/list-query.util';
import {
  AthleteProfile,
  AthleteProfileDocument,
} from '../schemas/athlete-profile.schema';
import { Invite, InviteDocument } from '../schemas/invite.schema';
import { User, UserDocument, type UserAddress } from '../schemas/user.schema';

export interface CreateUserInput {
  phone: string;
  firstName?: string;
  lastName?: string;
  roles?: Role[];
  password?: string;
  referralCode?: string;
  phoneVerified?: boolean;
}

export interface PublicUser {
  id: string;
  phone: string;
  name: { first: string | null; last: string | null };
  avatar: { mediaId: string | null };
  demographics: { gender: string | null; birthDate: Date | null };
  address: {
    provinceId: string | null;
    city: string | null;
    district: string | null;
    street: string | null;
    apartment: string | null;
    postalCode: string | null;
    point: { lat: number; lng: number } | null;
  };
  favouriteLocations: Array<{
    id: string;
    kind: string;
    label: string | null;
    address: PublicUser['address'];
  }>;
  nationalId: string | null;
  roles: Role[];
  code: string | null;
  referralCode: string | null;
  status: string;
  kyc: { status: string; verifiedAt: Date | null };
  phoneVerifiedAt: Date | null;
  credentials: { password: 'set' | 'unset' };
  createdAt: Date;
}

/** Safe subset for unauthenticated discovery surfaces — no phone/PII. */
export interface DiscoveryPublicUser {
  id: string;
  name: { first: string | null; last: string | null };
  avatar: { mediaId: string | null };
  demographics: { gender: string | null };
  code: string | null;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Invite.name)
    private readonly inviteModel: Model<InviteDocument>,
    @InjectModel(AthleteProfile.name)
    private readonly athleteModel: Model<AthleteProfileDocument>,
    private readonly audit: AuditService,
  ) {}

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /** Lean summaries for admin review queues (name / phone / code). */
  async findSummariesByIds(ids: Array<string | Types.ObjectId>) {
    if (ids.length === 0) return [];
    return this.userModel
      .find({ _id: { $in: ids } })
      .select('phone name code kycStatus')
      .lean();
  }

  /** Bounded identity lookup used by operational booking/member searches. */
  async findIdsBySearch(
    search: string,
    limit = 200,
  ): Promise<Types.ObjectId[]> {
    const users = await this.userModel
      .find(
        createSearchFilter(search, [
          'phone',
          'name.first',
          'name.last',
          'code',
        ]),
      )
      .select('_id')
      .limit(limit)
      .lean();
    return users.map((user) => user._id);
  }

  async findByPhone(phone: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phone });
  }

  /** Ensure a pre-existing account can participate in athlete-owned flows. */
  async ensureAthlete(user: UserDocument): Promise<UserDocument> {
    if (!user.roles.includes(Role.ATHLETE)) {
      await this.userModel.updateOne(
        { _id: user._id },
        { $addToSet: { roles: Role.ATHLETE } },
      );
      user.roles.push(Role.ATHLETE);
    }
    await this.athleteModel.updateOne(
      { userId: user._id },
      { $setOnInsert: { userId: user._id } },
      { upsert: true },
    );
    return user;
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

    const roles = input.roles?.length ? input.roles : [Role.ATHLETE];

    const user = await this.createWithUniqueCodes({
      phone: input.phone,
      name: {
        first: input.firstName,
        last: input.lastName,
      },
      roles,
      passwordHash: input.password
        ? await argon2.hash(input.password)
        : undefined,
      referredBy: referrer?._id,
      phoneVerifiedAt: input.phoneVerified ? new Date() : undefined,
    });

    if (roles.includes(Role.ATHLETE)) {
      await this.athleteModel.updateOne(
        { userId: user._id },
        { $setOnInsert: { userId: user._id } },
        { upsert: true },
      );
    }

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

  private async createWithUniqueCodes(
    doc: Partial<User>,
    attempt = 0,
  ): Promise<UserDocument> {
    try {
      return await this.userModel.create({
        ...doc,
        code: buildUserCode(doc.name?.first, doc.name?.last),
        referralCode: buildReferralCode(doc.name?.first),
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

  async refreshCodeIfAuto(user: UserDocument): Promise<void> {
    if (
      user.code?.startsWith('user-') &&
      (user.name?.first || user.name?.last)
    ) {
      user.code = buildUserCode(user.name?.first, user.name?.last);
      await user.save();
    }
  }

  toPublic(
    user: UserDocument,
    opts?: { revealNationalId?: boolean },
  ): PublicUser {
    const nationalId = user.nationalId ?? null;
    return {
      id: user._id.toString(),
      phone: user.phone,
      name: {
        first: user.name?.first ?? null,
        last: user.name?.last ?? null,
      },
      avatar: {
        mediaId: user.avatar?.mediaId?.toString() ?? null,
      },
      demographics: {
        gender: user.demographics?.gender ?? null,
        birthDate: user.demographics?.birthDate ?? null,
      },
      address: this.toPublicAddress(user.address),
      favouriteLocations: (user.favouriteLocations ?? []).map((item) => ({
        id: item._id.toString(),
        kind: item.kind,
        label: item.label?.trim() ? item.label.trim() : null,
        address: this.toPublicAddress(item.address),
      })),
      nationalId:
        opts?.revealNationalId && nationalId
          ? nationalId
          : nationalId
            ? `${nationalId.slice(0, 3)}****${nationalId.slice(-3)}`
            : null,
      roles: user.roles,
      code: user.code ?? null,
      referralCode: user.referralCode ?? null,
      status: user.status,
      kyc: {
        status: user.kycStatus,
        verifiedAt: user.kycVerifiedAt ?? null,
      },
      phoneVerifiedAt: user.phoneVerifiedAt ?? null,
      credentials: {
        password: user.passwordHash ? "set" : "unset",
      },
      createdAt: user.createdAt,
    };
  }

  toDiscoveryPublic(user: UserDocument): DiscoveryPublicUser {
    return {
      id: user._id.toString(),
      name: {
        first: user.name?.first ?? null,
        last: user.name?.last ?? null,
      },
      avatar: {
        mediaId: user.avatar?.mediaId?.toString() ?? null,
      },
      demographics: {
        gender: user.demographics?.gender ?? null,
      },
      code: user.code ?? null,
    };
  }

  private toPublicAddress(address?: UserAddress | null): PublicUser['address'] {
    return {
      provinceId: address?.provinceId?.toString() ?? null,
      city: address?.city ?? null,
      district: address?.district ?? null,
      street: address?.street ?? null,
      apartment: address?.apartment ?? null,
      postalCode: address?.postalCode ?? null,
      point: address?.point
        ? {
            lat: address.point.coordinates[1],
            lng: address.point.coordinates[0],
          }
        : null,
    };
  }
}
