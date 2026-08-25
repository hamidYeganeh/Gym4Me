import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, type QueryFilter } from 'mongoose';
import {
  ClubLifecycleStatus,
  ClubOperationalStatus,
  UserStatus,
  VerificationStatus,
} from '../../common/enums';
import {
  paginatedResult,
  resolvePageSize,
} from '../../common/utils/pagination.util';
import { Club, ClubDocument } from '../../schemas/club.schema';
import {
  CoachProfile,
  CoachProfileDocument,
} from '../../schemas/coach-profile.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { uniqueCoachTypes } from './coach-types';
import { DiscoveryCoachesQueryDto } from './dto/discovery-coaches.dto';
import { approvedCoachVerificationFilter } from './coach-verification-visibility';

@Injectable()
export class DiscoveryCoachesService {
  constructor(
    @InjectModel(CoachProfile.name)
    private readonly coachModel: Model<CoachProfileDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,
  ) {}

  async list(query: DiscoveryCoachesQueryDto) {
    const { page, pageSize } = resolvePageSize(query);
    const filter: QueryFilter<CoachProfileDocument> = {
      ...approvedCoachVerificationFilter(),
    };

    if (query.sportId?.trim()) {
      filter.sportIds = query.sportId.trim();
    }
    if (query.cityId && Types.ObjectId.isValid(query.cityId)) {
      filter['serviceArea.cityId'] = new Types.ObjectId(query.cityId);
    }
    if (query.coachType) {
      filter.coachTypes = query.coachType;
    }
    if (query.availability === 'remote') {
      filter['pricing.consultation.remote'] = { $ne: null };
    }
    if (query.availability === 'in-person') {
      filter['pricing.consultation.inPerson'] = { $ne: null };
    }
    if (query.fresh) {
      filter.createdAt = {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1_000),
      };
    }

    const profiles = await this.coachModel
      .find(filter)
      .sort({ 'experience.years': -1, updatedAt: -1 });

    const userIds = profiles.map((p) => p.userId);
    const users = userIds.length
      ? await this.userModel.find({
          _id: { $in: userIds },
          status: UserStatus.ACTIVE,
        })
      : [];
    const userById = new Map(users.map((u) => [u._id.toString(), u]));

    const q = query.q?.trim().toLowerCase();
    const gender = query.gender?.trim().toLowerCase();

    const matched = profiles.filter((profile) => {
      const user = userById.get(profile.userId.toString());
      if (!user) return false;
      if (
        gender &&
        (user.demographics?.gender ?? '').toLowerCase() !== gender
      ) {
        return false;
      }
      if (q) {
        const first = (user.name?.first ?? '').toLowerCase();
        const last = (user.name?.last ?? '').toLowerCase();
        const headline = (profile.experience?.headline ?? '').toLowerCase();
        const bio = (profile.bio ?? '').toLowerCase();
        const haystack = `${first} ${last} ${headline} ${bio}`;
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    const total = matched.length;
    const pageItems = matched.slice((page - 1) * pageSize, page * pageSize);
    const result = await Promise.all(
      pageItems.map((profile) =>
        this.toDiscoveryCoach(
          profile,
          userById.get(profile.userId.toString())!,
          { includeClubs: false },
        ),
      ),
    );

    return paginatedResult(result, total, page, pageSize);
  }

  async get(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Coach not found');
    }

    const profile = await this.coachModel.findOne({
      userId: new Types.ObjectId(userId),
      ...approvedCoachVerificationFilter(),
    });
    if (!profile) throw new NotFoundException('Coach not found');

    const user = await this.userModel.findOne({
      _id: profile.userId,
      status: UserStatus.ACTIVE,
    });
    if (!user) throw new NotFoundException('Coach not found');

    return this.toDiscoveryCoach(profile, user, { includeClubs: true });
  }

  private async toDiscoveryCoach(
    profile: CoachProfileDocument,
    user: UserDocument,
    options: { includeClubs: boolean },
  ) {
    const coachUserId = profile.userId.toString();
    const clubs = options.includeClubs
      ? await this.listAffiliatedClubs(coachUserId)
      : undefined;

    return {
      id: profile._id.toString(),
      userId: coachUserId,
      user: {
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
      },
      bio: profile.bio ?? null,
      experience: {
        years: profile.experience?.years ?? null,
        headline: profile.experience?.headline ?? null,
      },
      /** Q8 — public verification signal only (no docs / review notes). */
      verification: {
        status: profile.verification?.status ?? VerificationStatus.UNSUBMITTED,
        reviewedAt: profile.verification?.reviewedAt ?? null,
        credential: profile.verification?.credential
          ? {
              typeKey: profile.verification.credential.typeKey,
              issuer: profile.verification.credential.issuer,
              issuedAt: profile.verification.credential.issuedAt ?? null,
              expiresAt: profile.verification.credential.expiresAt,
            }
          : null,
      },
      serviceArea: {
        cityId: profile.serviceArea?.cityId?.toString() ?? null,
      },
      pricing: {
        consultation: {
          inPerson: profile.pricing?.consultation?.inPerson ?? null,
          remote: profile.pricing?.consultation?.remote ?? null,
        },
      },
      sportIds: profile.sportIds ?? [],
      coachTypes: uniqueCoachTypes(profile.coachTypes),
      ...(clubs ? { clubs } : {}),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  private async listAffiliatedClubs(userId: string) {
    const clubs = await this.clubModel
      .find({
        'coaches.coachId': new Types.ObjectId(userId),
        'review.status': ClubLifecycleStatus.APPROVED,
        operationalStatus: ClubOperationalStatus.ACTIVE,
      })
      .select({ identity: 1, location: 1 });

    return clubs.map((club) => ({
      id: club._id.toString(),
      name: club.identity?.name ?? '',
      coverMediaId: club.identity?.coverMediaId?.toString() ?? null,
      address: club.location?.address ?? null,
    }));
  }
}
