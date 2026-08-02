import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { Request } from 'express';
import { AuditService } from '../../audit/audit.service';
import {
  AuditAction,
  KycRequestKind,
  KycRequestStatus,
  KycStatus,
} from '../../common/enums';
import { isValidIranNationalId } from '../../common/utils/national-id.util';
import {
  KycRequest,
  KycRequestDocument,
} from '../../schemas/kyc-request.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { UsersService } from '../../users/users.service';
import { SubmitIdentityDto } from './dto/kyc.dto';
import { KycProviderService } from './kyc-provider.service';

@Injectable()
export class KycService {
  constructor(
    @InjectModel(KycRequest.name)
    private readonly kycModel: Model<KycRequestDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly users: UsersService,
    private readonly provider: KycProviderService,
    private readonly audit: AuditService,
  ) {}

  async status(userId: string) {
    const user = await this.users.findById(userId);
    const requests = await this.kycModel
      .find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    const identity = requests.find((r) => r.kind === KycRequestKind.IDENTITY);

    return {
      kycStatus: user.kycStatus,
      kycVerifiedAt: user.kycVerifiedAt ?? null,
      identity: identity
        ? { status: identity.status, rejectionReason: identity.rejectionReason ?? null }
        : { status: 'not_submitted' },
      documents: requests
        .filter((r) => r.kind === KycRequestKind.DOCUMENT)
        .map((r) => this.toPublicRequest(r)),
    };
  }

  async submitIdentity(userId: string, dto: SubmitIdentityDto, request: Request) {
    if (!isValidIranNationalId(dto.nationalId)) {
      throw new BadRequestException('Invalid national ID');
    }

    const user = await this.users.findById(userId);

    const usedByOther = await this.userModel.exists({
      nationalId: dto.nationalId,
      _id: { $ne: user._id },
    });
    if (usedByOther) {
      throw new ConflictException('National ID already registered');
    }

    const pending = await this.kycModel.exists({
      userId: user._id,
      kind: KycRequestKind.IDENTITY,
      status: KycRequestStatus.PENDING,
    });
    if (pending) {
      throw new ConflictException('An identity check is already pending');
    }
    if (user.kycStatus === KycStatus.APPROVED) {
      throw new ConflictException('Identity already verified');
    }

    const result = await this.provider.verifyIdentity({
      phone: user.phone,
      nationalId: dto.nationalId,
      birthDate: dto.birthDate,
    });

    const kycRequest = await this.kycModel.create({
      userId: user._id,
      kind: KycRequestKind.IDENTITY,
      status: result.approved
        ? KycRequestStatus.APPROVED
        : KycRequestStatus.REJECTED,
      nationalId: dto.nationalId,
      birthDate: dto.birthDate,
      rejectionReason: result.approved ? undefined : result.reason,
      providerResponse: result.raw,
    });

    if (result.approved) {
      user.nationalId = dto.nationalId;
      await user.save();
    }
    await this.recomputeUserKycStatus(user._id);

    this.audit.log({
      action: AuditAction.KYC_IDENTITY_SUBMITTED,
      actorId: user._id,
      targetUserId: user._id,
      metadata: { approved: result.approved, requestId: kycRequest._id.toString() },
      request,
    });

    return this.status(userId);
  }

  async submitDocument(
    userId: string,
    documentType: string,
    file: Express.Multer.File,
    request: Request,
  ) {
    const user = await this.users.findById(userId);

    const kycRequest = await this.kycModel.create({
      userId: user._id,
      kind: KycRequestKind.DOCUMENT,
      status: KycRequestStatus.PENDING,
      documentType,
      filePath: file.path,
      fileMimeType: file.mimetype,
    });

    await this.recomputeUserKycStatus(user._id);

    this.audit.log({
      action: AuditAction.KYC_DOCUMENT_SUBMITTED,
      actorId: user._id,
      targetUserId: user._id,
      metadata: { documentType, requestId: kycRequest._id.toString() },
      request,
    });

    return this.toPublicRequest(kycRequest.toObject());
  }

  async myDocuments(userId: string) {
    const items = await this.kycModel
      .find({
        userId: new Types.ObjectId(userId),
        kind: KycRequestKind.DOCUMENT,
      })
      .sort({ createdAt: -1 })
      .lean();
    return { items: items.map((r) => this.toPublicRequest(r)) };
  }

  /**
   * Rollup onto user.kycStatus: any approved → approved; else any pending →
   * pending; else any rejected → rejected; else none.
   */
  async recomputeUserKycStatus(userId: Types.ObjectId): Promise<void> {
    const statuses = await this.kycModel.distinct('status', { userId });

    let kycStatus = KycStatus.NONE;
    if (statuses.includes(KycRequestStatus.APPROVED)) {
      kycStatus = KycStatus.APPROVED;
    } else if (statuses.includes(KycRequestStatus.PENDING)) {
      kycStatus = KycStatus.PENDING;
    } else if (statuses.includes(KycRequestStatus.REJECTED)) {
      kycStatus = KycStatus.REJECTED;
    }

    await this.userModel.updateOne(
      { _id: userId },
      [
        {
          $set: {
            kycStatus,
            kycVerifiedAt:
              kycStatus === KycStatus.APPROVED
                ? { $ifNull: ['$kycVerifiedAt', '$$NOW'] }
                : null,
          },
        },
      ],
      { updatePipeline: true },
    );
  }

  private toPublicRequest(r: KycRequest & { _id: Types.ObjectId }) {
    return {
      id: r._id.toString(),
      kind: r.kind,
      status: r.status,
      documentType: r.documentType ?? null,
      rejectionReason: r.rejectionReason ?? null,
      createdAt: r.createdAt,
    };
  }
}
