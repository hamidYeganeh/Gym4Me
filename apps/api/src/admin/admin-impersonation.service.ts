import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Request } from 'express';
import { Model, Types } from 'mongoose';
import { TokenService } from '../account/auth/token.service';
import { AuditService } from '../audit/audit.service';
import {
  AuditAction,
  ImpersonationSessionStatus,
} from '../common/enums';
import {
  ImpersonationSession,
  ImpersonationSessionDocument,
} from '../schemas/impersonation-session.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class AdminImpersonationService {
  constructor(
    @InjectModel(ImpersonationSession.name)
    private readonly sessionModel: Model<ImpersonationSessionDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly audit: AuditService,
    private readonly tokens: TokenService,
  ) {}

  /**
   * Start an impersonation session and issue a short-lived access token
   * carrying the `impersonation` claim. The JWT strategy rejects the token
   * as soon as the session is ended.
   */
  async start(
    adminId: string,
    targetUserId: string,
    reason: string,
    request?: Request,
  ) {
    if (!reason?.trim() || reason.trim().length < 3) {
      throw new BadRequestException('reason is required (min 3 chars)');
    }
    if (!Types.ObjectId.isValid(targetUserId)) {
      throw new NotFoundException('Target user not found');
    }
    const target = await this.userModel.findById(targetUserId);
    if (!target) throw new NotFoundException('Target user not found');

    const session = await this.sessionModel.create({
      adminId: new Types.ObjectId(adminId),
      targetUserId: new Types.ObjectId(targetUserId),
      reason: reason.trim(),
      status: ImpersonationSessionStatus.ACTIVE,
      startedAt: new Date(),
    });

    const token = await this.tokens.issueImpersonationToken(target, {
      sessionId: session._id.toString(),
      adminId,
    });

    this.audit.log({
      action: AuditAction.ADMIN_IMPERSONATION_STARTED,
      actorId: adminId,
      targetUserId,
      metadata: { sessionId: session._id.toString(), reason: reason.trim() },
      request,
    });

    return {
      id: session._id.toString(),
      adminId,
      targetUserId,
      reason: session.reason,
      status: session.status,
      startedAt: session.startedAt.toISOString(),
      accessToken: token.accessToken,
      expiresInSeconds: token.expiresInSeconds,
    };
  }

  async end(adminId: string, sessionId: string, request?: Request) {
    if (!Types.ObjectId.isValid(sessionId)) {
      throw new NotFoundException('Impersonation session not found');
    }
    const session = await this.sessionModel.findById(sessionId);
    if (!session) throw new NotFoundException('Impersonation session not found');
    if (session.adminId.toString() !== adminId) {
      throw new BadRequestException('Not your impersonation session');
    }
    if (session.status === ImpersonationSessionStatus.ENDED) {
      return this.toPublic(session);
    }
    session.status = ImpersonationSessionStatus.ENDED;
    session.endedAt = new Date();
    await session.save();

    this.audit.log({
      action: AuditAction.ADMIN_IMPERSONATION_ENDED,
      actorId: adminId,
      targetUserId: session.targetUserId,
      metadata: { sessionId },
      request,
    });
    return this.toPublic(session);
  }

  private toPublic(session: ImpersonationSessionDocument) {
    return {
      id: session._id.toString(),
      adminId: session.adminId.toString(),
      targetUserId: session.targetUserId.toString(),
      reason: session.reason,
      status: session.status,
      startedAt: session.startedAt.toISOString(),
      endedAt: session.endedAt?.toISOString() ?? null,
    };
  }
}
