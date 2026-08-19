import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { QueryFilter } from 'mongoose';
import type { Request } from 'express';
import { RoleMembershipService } from '../account/roles/role-membership.service';
import { ProfileService } from '../account/profile/profile.service';
import { EventWriterService } from '../analytics/event-writer.service';
import { AuditService } from '../audit/audit.service';
import {
  AnalyticsEventName,
  AuditAction,
  VerificationStatus,
} from '../common/enums';
import {
  paginatedResult,
  resolvePageSize,
} from '../common/utils/pagination.util';
import {
  createSearchFilter,
  resolveListSort,
} from '../common/utils/list-query.util';
import {
  CoachProfile,
  CoachProfileDocument,
} from '../schemas/coach-profile.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { UsersService } from '../users/users.service';
import {
  ListCoachVerificationsQueryDto,
  ReviewVerificationDto,
} from './dto/admin-review.dto';

const COACH_VERIFICATION_SORT_FIELDS = {
  submittedAt: 'verification.submittedAt',
  reviewedAt: 'verification.reviewedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  status: 'verification.status',
  experienceYears: 'experience.years',
} as const;

@Injectable()
export class AdminVerificationService {
  constructor(
    @InjectModel(CoachProfile.name)
    private readonly coachModel: Model<CoachProfileDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly profiles: ProfileService,
    private readonly users: UsersService,
    private readonly roles: RoleMembershipService,
    private readonly audit: AuditService,
    private readonly events: EventWriterService,
  ) {}

  async listCoachVerifications(query: ListCoachVerificationsQueryDto) {
    const filter: QueryFilter<CoachProfileDocument> = {};
    if (query.status && query.status.length > 0) {
      filter['verification.status'] = { $in: query.status };
    } else if (query.status === undefined) {
      filter['verification.status'] = VerificationStatus.PENDING;
    }

    if (query.search?.trim()) {
      const userIds = await this.userModel
        .find(
          createSearchFilter(query.search, [
            'phone',
            'name.first',
            'name.last',
            'code',
          ]),
        )
        .select({ _id: 1 })
        .lean();
      const profileSearch = createSearchFilter(query.search, [
        'bio',
        'experience.headline',
        'verification.reviewNote',
      ]) as { $or?: QueryFilter<CoachProfileDocument>[] };
      filter.$or = [
        ...(profileSearch.$or ?? []),
        { userId: { $in: userIds.map((user) => user._id) } },
      ];
    }

    const { page, pageSize } = resolvePageSize(query);
    const sort = resolveListSort(query, COACH_VERIFICATION_SORT_FIELDS, {
      'verification.submittedAt': -1,
    });
    const [items, total] = await Promise.all([
      this.coachModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.coachModel.countDocuments(filter),
    ]);

    const summaries = await this.users.findSummariesByIds(
      items.map((item) => item.userId),
    );
    const byId = new Map(
      summaries.map((u) => [
        u._id.toString(),
        {
          id: u._id.toString(),
          phone: u.phone,
          name: u.name,
          code: u.code ?? null,
          kycStatus: u.kycStatus,
        },
      ]),
    );

    return paginatedResult(
      items.map((p) => {
        const userId = p.userId.toString();
        return {
          userId,
          user: byId.get(userId) ?? { id: userId },
          verification: {
            status: p.verification?.status ?? VerificationStatus.UNSUBMITTED,
            submittedAt: p.verification?.submittedAt ?? null,
            reviewedAt: p.verification?.reviewedAt ?? null,
            reviewNote: p.verification?.reviewNote ?? null,
            documentMediaIds: (p.verification?.documentMediaIds ?? []).map(
              (id) => id.toString(),
            ),
          },
          experience: p.experience ?? {},
          bio: p.bio ?? null,
        };
      }),
      total,
      page,
      pageSize,
    );
  }

  async reviewCoach(
    userId: string,
    dto: ReviewVerificationDto,
    adminId: string,
    request: Request,
  ) {
    if (dto.action === 'reject' && !dto.reviewNote?.trim()) {
      throw new BadRequestException('Reject reason is required');
    }

    const profile = await this.profiles.getCoachProfileByUserId(userId);
    if (profile.verification.status !== VerificationStatus.PENDING) {
      throw new ConflictException('Coach verification is not pending');
    }

    // Prefer RoleRequest path (grants role + notifies + syncs verification).
    const handled = await this.roles.syncFromCoachVerificationReview(
      userId,
      dto.action,
      adminId,
      dto.reviewNote,
      request,
    );

    if (handled) {
      const refreshed = await this.profiles.getCoachProfileByUserId(userId);
      return {
        userId,
        verification: {
          status: refreshed.verification.status,
          reviewedAt: refreshed.verification.reviewedAt,
          reviewNote: refreshed.verification.reviewNote ?? null,
        },
      };
    }

    profile.verification.status =
      dto.action === 'approve'
        ? VerificationStatus.APPROVED
        : VerificationStatus.REJECTED;
    profile.verification.reviewedAt = new Date();
    profile.verification.reviewedBy = new Types.ObjectId(adminId);
    profile.verification.reviewNote =
      dto.action === 'reject' ? (dto.reviewNote ?? 'Rejected') : dto.reviewNote;
    profile.markModified('verification');
    await profile.save();

    this.audit.log({
      action: AuditAction.COACH_VERIFICATION_REVIEWED,
      actorId: adminId,
      targetUserId: userId,
      metadata: {
        action: dto.action,
        reviewNote: profile.verification.reviewNote,
      },
      request,
    });

    await this.events.track({
      eventName: AnalyticsEventName.COACH_VERIFICATION_REVIEWED,
      actor: { userId: adminId },
      properties: { targetUserId: userId, action: dto.action },
    });

    return {
      userId,
      verification: {
        status: profile.verification.status,
        reviewedAt: profile.verification.reviewedAt,
        reviewNote: profile.verification.reviewNote ?? null,
      },
    };
  }
}
