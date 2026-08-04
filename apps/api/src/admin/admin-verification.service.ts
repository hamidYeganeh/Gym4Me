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
  ClubLifecycleStatus,
  VerificationStatus,
} from '../common/enums';
import { Club, ClubDocument } from '../schemas/club.schema';
import {
  CoachProfile,
  CoachProfileDocument,
} from '../schemas/coach-profile.schema';
import { ClubsService } from '../account/clubs/clubs.service';
import { ProfileService } from '../account/profile/profile.service';
import { ReviewVerificationDto } from './dto/admin-review.dto';

@Injectable()
export class AdminVerificationService {
  constructor(
    @InjectModel(CoachProfile.name)
    private readonly coachModel: Model<CoachProfileDocument>,
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,
    private readonly profiles: ProfileService,
    private readonly clubs: ClubsService,
    private readonly audit: AuditService,
    private readonly events: EventWriterService,
  ) {}

  async listCoachVerifications(query: {
    status?: VerificationStatus;
    page?: number;
    limit?: number;
  }) {
    const filter: QueryFilter<CoachProfileDocument> = {};
    if (query.status) filter['verification.status'] = query.status;
    else filter['verification.status'] = VerificationStatus.PENDING;

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [items, total] = await Promise.all([
      this.coachModel
        .find(filter)
        .sort({ 'verification.submittedAt': -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.coachModel.countDocuments(filter),
    ]);

    return {
      items: items.map((p) => ({
        userId: p.userId.toString(),
        verification: {
          status: p.verification?.status,
          submittedAt: p.verification?.submittedAt ?? null,
          documentMediaIds: (p.verification?.documentMediaIds ?? []).map((id) =>
            id.toString(),
          ),
          reviewNote: p.verification?.reviewNote ?? null,
        },
        experience: p.experience ?? {},
        bio: p.bio ?? null,
      })),
      total,
      page,
      limit,
    };
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

  async listClubReviews(query: {
    status?: ClubLifecycleStatus;
    page?: number;
    limit?: number;
  }) {
    const filter: QueryFilter<ClubDocument> = {};
    if (query.status) filter['review.status'] = query.status;
    else filter['review.status'] = ClubLifecycleStatus.PENDING_REVIEW;

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [items, total] = await Promise.all([
      this.clubModel
        .find(filter)
        .sort({ 'review.submittedAt': -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.clubModel.countDocuments(filter),
    ]);

    return {
      items: items.map((c) => this.clubs.toPublic(c)),
      total,
      page,
      limit,
    };
  }

  async reviewClub(
    clubId: string,
    dto: ReviewVerificationDto,
    adminId: string,
    request: Request,
  ) {
    const club = await this.clubModel.findById(clubId);
    if (!club) throw new NotFoundException('Club not found');
    if (club.review.status !== ClubLifecycleStatus.PENDING_REVIEW) {
      throw new ConflictException('Club is not pending review');
    }

    club.review.status =
      dto.action === 'approve'
        ? ClubLifecycleStatus.APPROVED
        : ClubLifecycleStatus.REJECTED;
    club.review.reviewedAt = new Date();
    club.review.reviewedBy = new Types.ObjectId(adminId);
    club.review.reviewNote =
      dto.action === 'reject'
        ? (dto.reviewNote ?? 'Rejected')
        : dto.reviewNote;
    club.markModified('review');
    await club.save();

    this.audit.log({
      action: AuditAction.CLUB_REVIEWED,
      actorId: adminId,
      targetUserId: club.ownerId,
      metadata: {
        clubId,
        action: dto.action,
        reviewNote: club.review.reviewNote,
      },
      request,
    });

    await this.events.track({
      eventName: AnalyticsEventName.CLUB_REVIEWED,
      actor: { userId: adminId },
      context: { clubId },
      properties: { action: dto.action, ownerId: club.ownerId.toString() },
    });

    return this.clubs.toPublic(club);
  }
}
