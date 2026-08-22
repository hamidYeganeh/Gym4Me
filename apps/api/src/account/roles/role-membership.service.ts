import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Request } from 'express';
import { Model, Types, type QueryFilter } from 'mongoose';
import { EventWriterService } from '../../analytics/event-writer.service';
import { AuditService } from '../../audit/audit.service';
import {
  AnalyticsEventName,
  AuditAction,
  NotificationTemplateKey,
  Role,
  VerificationStatus,
} from '../../common/enums';
import type { JwtUser } from '../../common/types';
import {
  createSearchFilter,
  resolveListSort,
} from '../../common/utils/list-query.util';
import {
  paginatedResult,
  resolvePageSize,
} from '../../common/utils/pagination.util';
import { NotificationsService } from '../../notifications/notifications.service';
import {
  ROLE_REQUEST_ROLES,
  RoleRequest,
  RoleRequestDocument,
} from '../../schemas/role-request.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { UsersService } from '../../users/users.service';
import { ProfileService } from '../profile/profile.service';
import type {
  ListRoleRequestsQueryDto,
  ReviewRoleRequestDto,
  SubmitRoleRequestDto,
} from './dto/roles.dto';

const ROLE_LABEL_FA: Record<string, string> = {
  [Role.COACH]: 'مربی',
  [Role.CLUB_OWNER]: 'باشگاه‌دار',
};

const ROLE_REQUEST_SORT_FIELDS = {
  submittedAt: 'submittedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  status: 'status',
  role: 'role',
} as const;

@Injectable()
export class RoleMembershipService {
  constructor(
    @InjectModel(RoleRequest.name)
    private readonly roleRequests: Model<RoleRequestDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly users: UsersService,
    private readonly profiles: ProfileService,
    private readonly audit: AuditService,
    private readonly events: EventWriterService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Role overview for the signed-in user.
   * Separates availabilities (already granted → switchable) from actions (request flow).
   */
  async listMine(jwt: JwtUser) {
    const user = await this.users.findById(jwt.sub);
    const requests = await this.roleRequests
      .find({ userId: new Types.ObjectId(jwt.sub) })
      .lean();
    const byRole = new Map(requests.map((item) => [item.role, item]));

    const availabilities = user.roles
      .filter((role) => role !== Role.ADMIN)
      .map((role) => ({
        role,
        canSwitch: true,
        active: jwt.activeRole === role,
      }));

    const actions = ROLE_REQUEST_ROLES.map((role) => {
      const hasRole = user.roles.includes(role);
      const request = byRole.get(role);
      return {
        role,
        hasRole,
        request: request ? this.toPublic(request) : null,
        nextStep: this.nextStep(role, hasRole, request?.status),
      };
    });

    return {
      roles: user.roles,
      activeRole: jwt.activeRole,
      availabilities,
      actions,
    };
  }

  /**
   * Start (or resume) a self-service role application. Does NOT grant the role.
   */
  async applyRole(jwt: JwtUser, role: Role, request: Request) {
    this.assertSelfApplicable(role);

    const user = await this.users.findById(jwt.sub);
    if (user.roles.includes(role)) {
      throw new ConflictException(`You already have the "${role}" role`);
    }

    let doc = await this.roleRequests.findOne({
      userId: new Types.ObjectId(jwt.sub),
      role,
    });

    if (!doc) {
      doc = await this.roleRequests.create({
        userId: new Types.ObjectId(jwt.sub),
        role,
        status: VerificationStatus.UNSUBMITTED,
        application: { documentMediaIds: [] },
        review: {},
      });
    }

    if (role === Role.COACH) {
      await this.profiles.ensureCoachProfile(jwt.sub);
    }

    this.audit.log({
      action: AuditAction.ROLE_APPLIED,
      actorId: jwt.sub,
      targetUserId: jwt.sub,
      metadata: { role, status: doc.status },
      request,
    });

    await this.events.track({
      eventName: AnalyticsEventName.ROLE_APPLIED,
      actor: { userId: jwt.sub, activeRole: jwt.activeRole },
      properties: { role, status: doc.status },
    });

    return {
      request: this.toPublic(doc),
      nextStep: this.nextStep(role, false, doc.status),
    };
  }

  /**
   * Submit documents / required fields → pending admin review.
   * Does NOT grant the role or switch activeRole.
   */
  async submit(
    jwt: JwtUser,
    role: Role,
    dto: SubmitRoleRequestDto,
    request: Request,
  ) {
    this.assertSelfApplicable(role);

    const user = await this.users.findById(jwt.sub);
    if (user.roles.includes(role)) {
      throw new ConflictException(`You already have the "${role}" role`);
    }

    let doc = await this.roleRequests.findOne({
      userId: new Types.ObjectId(jwt.sub),
      role,
    });

    if (!doc) {
      doc = new this.roleRequests({
        userId: new Types.ObjectId(jwt.sub),
        role,
        status: VerificationStatus.UNSUBMITTED,
        application: { documentMediaIds: [] },
        review: {},
      });
    }

    if (doc.status === VerificationStatus.PENDING) {
      throw new ConflictException('Role request already pending review');
    }
    if (doc.status === VerificationStatus.APPROVED) {
      throw new ConflictException('Role request already approved');
    }

    doc.application = {
      bio: dto.bio,
      headline: dto.headline,
      yearsExperience: dto.yearsExperience,
      documentMediaIds: dto.documentMediaIds.map(
        (id) => new Types.ObjectId(id),
      ),
      note: dto.note,
    };
    doc.markModified('application');
    doc.status = VerificationStatus.PENDING;
    doc.submittedAt = new Date();
    doc.review = {};
    doc.markModified('review');
    await doc.save();

    if (role === Role.COACH) {
      await this.syncCoachVerificationPending(jwt.sub, dto);
    }

    this.audit.log({
      action: AuditAction.ROLE_REQUEST_SUBMITTED,
      actorId: jwt.sub,
      targetUserId: jwt.sub,
      metadata: {
        role,
        documentCount: dto.documentMediaIds.length,
      },
      request,
    });

    await this.events.track({
      eventName: AnalyticsEventName.ROLE_REQUEST_SUBMITTED,
      actor: { userId: jwt.sub, activeRole: jwt.activeRole },
      properties: { role },
    });

    return {
      request: this.toPublic(doc),
      nextStep: this.nextStep(role, false, doc.status),
    };
  }

  async listForAdmin(query: ListRoleRequestsQueryDto) {
    const filter: QueryFilter<RoleRequestDocument> = {};
    if (query.status && query.status.length > 0) {
      filter.status = { $in: query.status };
    } else if (query.status === undefined) {
      filter.status = VerificationStatus.PENDING;
    }
    // status: [] means "all"
    if (query.role) {
      filter.role = query.role;
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
      filter.userId = { $in: userIds.map((user) => user._id) };
    }

    const { page, pageSize } = resolvePageSize(query);
    const sort = resolveListSort(query, ROLE_REQUEST_SORT_FIELDS, {
      submittedAt: -1,
    });
    const [items, total] = await Promise.all([
      this.roleRequests
        .find(filter)
        .sort(sort)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.roleRequests.countDocuments(filter),
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
      items.map((item) => ({
        ...this.toPublic(item),
        user: byId.get(item.userId.toString()) ?? {
          id: item.userId.toString(),
        },
      })),
      total,
      page,
      pageSize,
    );
  }

  async review(
    requestId: string,
    dto: ReviewRoleRequestDto,
    adminId: string,
    request: Request,
  ) {
    if (!Types.ObjectId.isValid(requestId)) {
      throw new BadRequestException('Invalid role request id');
    }

    const doc = await this.roleRequests.findById(requestId);
    if (!doc) {
      throw new NotFoundException('Role request not found');
    }
    if (doc.status !== VerificationStatus.PENDING) {
      throw new ConflictException('Role request is not pending');
    }

    if (dto.action === 'reject' && !dto.reviewNote?.trim()) {
      throw new BadRequestException('Reject reason is required');
    }

    const approved = dto.action === 'approve';
    doc.status = approved
      ? VerificationStatus.APPROVED
      : VerificationStatus.REJECTED;
    doc.review = {
      reviewedAt: new Date(),
      reviewedBy: new Types.ObjectId(adminId),
      reason: dto.reviewNote?.trim(),
    };
    doc.markModified('review');
    await doc.save();

    const userId = doc.userId.toString();

    if (approved) {
      await this.grantRole(userId, doc.role);
      if (doc.role === Role.COACH) {
        await this.syncCoachVerificationReviewed(
          userId,
          adminId,
          VerificationStatus.APPROVED,
          dto.reviewNote,
        );
      }
    } else if (doc.role === Role.COACH) {
      await this.syncCoachVerificationReviewed(
        userId,
        adminId,
        VerificationStatus.REJECTED,
        dto.reviewNote,
      );
    }

    this.audit.log({
      action: AuditAction.ROLE_REQUEST_REVIEWED,
      actorId: adminId,
      targetUserId: userId,
      metadata: {
        role: doc.role,
        action: dto.action,
        reason: doc.review.reason,
      },
      request,
    });

    await this.events.track({
      eventName: AnalyticsEventName.ROLE_REQUEST_REVIEWED,
      actor: { userId: adminId },
      properties: {
        targetUserId: userId,
        role: doc.role,
        action: dto.action,
      },
    });

    await this.notifyResult(
      userId,
      doc.role,
      approved,
      doc._id.toString(),
      doc.review.reason,
    );

    return this.toPublic(doc);
  }

  /**
   * Used when admin approves via legacy coach verification queue.
   * Returns true when RoleRequest pending was fully reviewed (verification already synced).
   */
  async syncFromCoachVerificationReview(
    userId: string,
    action: 'approve' | 'reject',
    adminId: string,
    reviewNote: string | undefined,
    request: Request,
  ): Promise<boolean> {
    const doc = await this.roleRequests.findOne({
      userId: new Types.ObjectId(userId),
      role: Role.COACH,
    });

    if (doc && doc.status === VerificationStatus.PENDING) {
      await this.review(
        doc._id.toString(),
        { action, reviewNote },
        adminId,
        request,
      );
      return true;
    }

    if (action === 'approve') {
      await this.grantRole(userId, Role.COACH);
    }

    await this.notifyResult(
      userId,
      Role.COACH,
      action === 'approve',
      `coach-verification:${userId}`,
      reviewNote,
    );

    return false;
  }

  private async grantRole(userId: string, role: Role) {
    const user = await this.users.findById(userId);
    if (!user.roles.includes(role)) {
      user.roles = [...user.roles, role];
      await user.save();
    }
    if (role === Role.COACH) {
      await this.profiles.ensureCoachProfile(userId);
    }
  }

  private async syncCoachVerificationPending(
    userId: string,
    dto: SubmitRoleRequestDto,
  ) {
    const profile = await this.profiles.ensureCoachProfile(userId);
    if (dto.bio !== undefined) profile.bio = dto.bio;
    if (dto.headline !== undefined || dto.yearsExperience !== undefined) {
      profile.experience = {
        ...(profile.experience ?? {}),
        headline: dto.headline ?? profile.experience?.headline,
        years: dto.yearsExperience ?? profile.experience?.years,
      };
      profile.markModified('experience');
    }
    profile.verification = {
      status: VerificationStatus.PENDING,
      submittedAt: new Date(),
      documentMediaIds: dto.documentMediaIds.map(
        (id) => new Types.ObjectId(id),
      ),
      reviewNote: dto.note,
    };
    profile.markModified('verification');
    await profile.save();
  }

  private async syncCoachVerificationReviewed(
    userId: string,
    adminId: string,
    status: VerificationStatus.APPROVED | VerificationStatus.REJECTED,
    reviewNote?: string,
  ) {
    try {
      const profile = await this.profiles.getCoachProfileByUserId(userId);
      profile.verification.status = status;
      profile.verification.reviewedAt = new Date();
      profile.verification.reviewedBy = new Types.ObjectId(adminId);
      profile.verification.reviewNote =
        status === VerificationStatus.REJECTED
          ? (reviewNote ?? 'Rejected')
          : reviewNote;
      profile.markModified('verification');
      await profile.save();
    } catch {
      // Profile may not exist yet for edge cases; grant path ensures shell.
    }
  }

  private async notifyResult(
    userId: string,
    role: Role,
    approved: boolean,
    idempotencyScope: string,
    reason?: string,
  ) {
    const result = approved
      ? 'تأیید شد'
      : `رد شد${reason ? ` — ${reason}` : ''}`;

    await this.notifications.dispatch({
      userId,
      templateKey: NotificationTemplateKey.ROLE_REQUEST_RESULT,
      params: {
        roleLabel: ROLE_LABEL_FA[role] ?? role,
        result,
      },
      payload: {
        role,
        approved,
        reason: reason ?? null,
        deepLink: approved
          ? `/${role === Role.CLUB_OWNER ? 'owner' : 'coach'}`
          : '/athlete/profile/roles',
      },
      critical: true,
      idempotencyKey: `role-request-result:${idempotencyScope}:${approved ? 'approved' : 'rejected'}`,
    });
  }

  private nextStep(
    role: Role,
    hasRole: boolean,
    status?: VerificationStatus,
  ): 'switch' | 'apply' | 'submit' | 'pending' | 'rejected' | null {
    if (hasRole) return 'switch';
    if (!status || status === VerificationStatus.UNSUBMITTED) return 'submit';
    if (status === VerificationStatus.PENDING) return 'pending';
    if (status === VerificationStatus.REJECTED) return 'submit';
    if (status === VerificationStatus.APPROVED) return 'switch';
    return 'apply';
  }

  private assertSelfApplicable(role: Role): asserts role is Role {
    if (!ROLE_REQUEST_ROLES.includes(role)) {
      throw new BadRequestException(
        `Role "${role}" cannot be self-applied; contact support/admin`,
      );
    }
  }

  private toPublic(
    doc: RoleRequestDocument | (RoleRequest & { _id: Types.ObjectId }),
  ) {
    const application = doc.application ?? { documentMediaIds: [] };
    const review = doc.review ?? {};
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      role: doc.role,
      status: doc.status,
      application: {
        bio: application.bio ?? null,
        headline: application.headline ?? null,
        yearsExperience: application.yearsExperience ?? null,
        documentMediaIds: (application.documentMediaIds ?? []).map((id) =>
          id.toString(),
        ),
        note: application.note ?? null,
      },
      review: {
        reviewedAt: review.reviewedAt ?? null,
        reviewedBy: review.reviewedBy?.toString() ?? null,
        reason: review.reason ?? null,
      },
      submittedAt: doc.submittedAt ?? null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
