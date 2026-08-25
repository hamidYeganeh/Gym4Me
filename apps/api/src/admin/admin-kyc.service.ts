import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createReadStream, existsSync, statSync } from 'fs';
import { Model, Types } from 'mongoose';
import type { QueryFilter } from 'mongoose';
import type { Request } from 'express';
import { basename, isAbsolute, join } from 'path';
import { KycService } from '../account/kyc/kyc.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction, KycRequestStatus } from '../common/enums';
import {
  createSearchFilter,
  resolveListSort,
} from '../common/utils/list-query.util';
import {
  paginatedResult,
  resolvePageSize,
} from '../common/utils/pagination.util';
import { KycRequest, KycRequestDocument } from '../schemas/kyc-request.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { ListKycRequestsQueryDto, ReviewKycDto } from './dto/admin.dto';

const KYC_REQUEST_SORT_FIELDS = {
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  reviewedAt: 'reviewedAt',
  birthDate: 'birthDate',
  status: 'status',
  kind: 'kind',
} as const;

type PopulatedUser = {
  _id: Types.ObjectId;
  phone?: string;
  name?: { first?: string | null; last?: string | null };
  code?: string | null;
  kycStatus?: string;
};

@Injectable()
export class AdminKycService {
  constructor(
    @InjectModel(KycRequest.name)
    private readonly kycModel: Model<KycRequestDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly kyc: KycService,
    private readonly audit: AuditService,
  ) {}

  async list(query: ListKycRequestsQueryDto) {
    const filter: QueryFilter<KycRequestDocument> = {};
    if (query.status) filter.status = { $in: query.status };
    if (query.kind) filter.kind = query.kind;

    if (query.search?.trim()) {
      const userIds = await this.userModel
        .find(
          createSearchFilter(query.search, [
            'phone',
            'name.first',
            'name.last',
            'code',
            'nationalId',
          ]),
        )
        .select({ _id: 1 })
        .lean();
      const ownSearch = createSearchFilter(query.search, [
        'nationalId',
        'documentType',
        'rejectionReason',
      ]) as { $or?: QueryFilter<KycRequestDocument>[] };
      filter.$or = [
        ...(ownSearch.$or ?? []),
        { userId: { $in: userIds.map((user) => user._id) } },
      ];
    }

    const { page, pageSize } = resolvePageSize(query);
    const sort = resolveListSort(query, KYC_REQUEST_SORT_FIELDS, {
      createdAt: -1,
    });

    const [items, total] = await Promise.all([
      this.kycModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .populate('userId', 'phone name code kycStatus')
        .lean(),
      this.kycModel.countDocuments(filter),
    ]);

    return paginatedResult(
      items.map((item) => this.toPublic(item)),
      total,
      page,
      pageSize,
    );
  }

  async openDocument(id: string) {
    const kycRequest = await this.kycModel.findById(id).lean();
    if (!kycRequest) throw new NotFoundException('KYC request not found');
    if (!kycRequest.filePath) {
      throw new NotFoundException('No document attached to this request');
    }

    const absolute = this.resolveUploadPath(kycRequest.filePath);
    if (!existsSync(absolute)) {
      throw new NotFoundException('Document file is missing on disk');
    }

    const stats = statSync(absolute);
    return {
      stream: createReadStream(absolute),
      mimeType: kycRequest.fileMimeType ?? 'application/octet-stream',
      size: stats.size,
      filename: basename(absolute),
    };
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

    const populated = await this.kycModel
      .findById(kycRequest._id)
      .populate('userId', 'phone name code kycStatus')
      .lean();
    return this.toPublic(populated!);
  }

  private toPublic(doc: {
    _id: Types.ObjectId;
    userId: Types.ObjectId | PopulatedUser | null;
    kind: string;
    status: string;
    documentType?: string;
    nationalId?: string;
    birthDate?: Date;
    filePath?: string;
    fileMimeType?: string;
    rejectionReason?: string;
    createdAt: Date;
    reviewedAt?: Date;
  }) {
    const id = doc._id.toString();
    const populated =
      doc.userId && typeof doc.userId === 'object' && '_id' in doc.userId
        ? (doc.userId as PopulatedUser)
        : null;

    return {
      id,
      userId: populated
        ? {
            id: populated._id.toString(),
            phone: populated.phone,
            name: populated.name,
            code: populated.code,
            kycStatus: populated.kycStatus,
          }
        : doc.userId instanceof Types.ObjectId
          ? doc.userId.toHexString()
          : null,
      kind: doc.kind,
      status: doc.status,
      documentType: doc.documentType ?? null,
      nationalId: doc.nationalId ?? null,
      birthDate: doc.birthDate ?? null,
      fileMimeType: doc.fileMimeType ?? null,
      hasDocument: Boolean(doc.filePath),
      documentUrl: doc.filePath ? `/admin/kyc/requests/${id}/document` : null,
      rejectionReason: doc.rejectionReason ?? null,
      createdAt: doc.createdAt,
      reviewedAt: doc.reviewedAt ?? null,
    };
  }

  private resolveUploadPath(stored: string): string {
    if (isAbsolute(stored)) return stored;
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    return join(uploadDir, stored);
  }
}
