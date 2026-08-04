import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { QueryFilter } from 'mongoose';
import type { Request } from 'express';
import { KycService } from '../account/kyc/kyc.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction, KycRequestStatus } from '../common/enums';
import {
  KycRequest,
  KycRequestDocument,
} from '../schemas/kyc-request.schema';
import { ListKycRequestsQueryDto, ReviewKycDto } from './dto/admin.dto';

@Injectable()
export class AdminKycService {
  constructor(
    @InjectModel(KycRequest.name)
    private readonly kycModel: Model<KycRequestDocument>,
    private readonly kyc: KycService,
    private readonly audit: AuditService,
  ) {}

  async list(query: ListKycRequestsQueryDto) {
    const filter: QueryFilter<KycRequestDocument> = {};
    if (query.status) filter.status = query.status;
    if (query.kind) filter.kind = query.kind;

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [items, total] = await Promise.all([
      this.kycModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'phone name code kycStatus')
        .lean(),
      this.kycModel.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  }

  async review(
    id: string,
    dto: ReviewKycDto,
    adminId: string,
    request: Request,
  ) {
    const kycRequest = await this.kycModel.findById(id);
    if (!kycRequest) throw new NotFoundException('KYC request not found');
    if (kycRequest.status !== KycRequestStatus.PENDING) {
      throw new ConflictException('This request has already been reviewed');
    }

    kycRequest.status =
      dto.action === 'approve'
        ? KycRequestStatus.APPROVED
        : KycRequestStatus.REJECTED;
    kycRequest.rejectionReason =
      dto.action === 'reject' ? (dto.rejectionReason ?? 'Rejected') : undefined;
    kycRequest.reviewedBy = new Types.ObjectId(adminId);
    kycRequest.reviewedAt = new Date();
    await kycRequest.save();

    await this.kyc.recomputeUserKycStatus(kycRequest.userId);

    this.audit.log({
      action: AuditAction.KYC_REVIEWED,
      actorId: adminId,
      targetUserId: kycRequest.userId,
      metadata: {
        requestId: kycRequest._id.toString(),
        kind: kycRequest.kind,
        action: dto.action,
        rejectionReason: kycRequest.rejectionReason,
      },
      request,
    });

    return kycRequest.toObject();
  }
}
