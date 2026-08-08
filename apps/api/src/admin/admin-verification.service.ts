import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { QueryFilter } from 'mongoose';
import type { Request } from 'express';
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
  CoachProfile,
  CoachProfileDocument,
} from '../schemas/coach-profile.schema';
import { ProfileService } from '../account/profile/profile.service';
import { UsersService } from '../users/users.service';
import { ReviewVerificationDto } from './dto/admin-review.dto';

@Injectable()
export class AdminVerificationService {
  constructor(
    @InjectModel(CoachProfile.name)
    private readonly coachModel: Model<CoachProfileDocument>,
    private readonly profiles: ProfileService,
    private readonly users: UsersService,
    private readonly audit: AuditService,
    private readonly events: EventWriterService,
  ) {}

  async listCoachVerifications(query: {
    status?: VerificationStatus | 'all';
    page?: number;
    limit?: number;
  }) {
    const filter: QueryFilter<CoachProfileDocument> = {};
    if (query.status && query.status !== 'all') {
      filter['verification.status'] = query.status;
    } else if (query.status !== 'all') {
      filter['verification.status'] = VerificationStatus.PENDING;
    }

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.coachModel
        .find(filter)
        .sort({ 'verification.submittedAt': -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.coachModel.countDocuments(filter),
    ]);

    const summaries = await this.users.findSummariesByIds(
      items.map((p) => p.userId),
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
            status: p.verification?.status,
            submittedAt: p.verification?.submittedAt ?? null,
            documentMediaIds: (p.verification?.documentMediaIds ?? []).map(
              (id) => id.toString(),
            ),
            reviewNote: p.verification?.reviewNote ?? null,
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
    const profile = await this.profiles.getCoachProfileByUserId(userId);
    if (profile.verification.status !== VerificationStatus.PENDING) {
      throw new ConflictException('Coach verification is not pending');
    }

    profile.verification.status =
      dto.action === 'approve'
        ? VerificationStatus.APPROVED
        : VerificationStatus.REJECTED;
    profile.verification.reviewedAt = new Date();
    profile.verification.reviewedBy = new Types.ObjectId(adminId);
    profile.verification.reviewNote =
      dto.action === 'reject'
        ? (dto.reviewNote ?? 'Rejected')
        : dto.reviewNote;
    profile.markModified('verification');
    await profile.save();

    this.audit.log({
      action: AuditAction.COACH_VERIFICATION_REVIEWED,
      actorId: adminId,
      targetUserId: userId,
      metadata: { action: dto.action, reviewNote: profile.verification.reviewNote },
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
