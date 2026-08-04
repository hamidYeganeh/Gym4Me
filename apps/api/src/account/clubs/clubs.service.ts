import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { Request } from 'express';
import { EventWriterService } from '../../analytics/event-writer.service';
import { AuditService } from '../../audit/audit.service';
import {
  AnalyticsEventName,
  AuditAction,
  ClubLifecycleStatus,
  Role,
} from '../../common/enums';
import type { JwtUser } from '../../common/types';
import { assertCanMutateAsRole } from '../../common/utils/role-assert.util';
import { Club, ClubDocument } from '../../schemas/club.schema';
import {
  CreateClubDto,
  SubmitClubReviewDto,
  UpdateClubDto,
} from './dto/club.dto';

@Injectable()
export class ClubsService {
  constructor(
    @InjectModel(Club.name) private readonly clubModel: Model<ClubDocument>,
    private readonly audit: AuditService,
    private readonly events: EventWriterService,
  ) {}

  async listMine(jwt: JwtUser) {
    assertCanMutateAsRole(jwt, Role.CLUB_OWNER);
    const items = await this.clubModel
      .find({ ownerId: new Types.ObjectId(jwt.sub) })
      .sort({ createdAt: -1 })
      .lean();
    return { items: items.map((c) => this.toPublic(c)) };
  }

  async getMine(jwt: JwtUser, clubId: string) {
    const club = await this.requireOwned(jwt, clubId);
    return this.toPublic(club);
  }

  async create(jwt: JwtUser, dto: CreateClubDto, request: Request) {
    assertCanMutateAsRole(jwt, Role.CLUB_OWNER);
    if (!dto.identity?.name?.trim()) {
      throw new BadRequestException('identity.name is required');
    }

    const club = await this.clubModel.create({
      ownerId: new Types.ObjectId(jwt.sub),
      identity: {
        name: dto.identity.name.trim(),
        description: dto.identity.description,
        coverMediaId: dto.identity.coverMediaId
          ? new Types.ObjectId(dto.identity.coverMediaId)
          : undefined,
        galleryMediaIds: (dto.identity.galleryMediaIds ?? []).map(
          (id) => new Types.ObjectId(id),
        ),
      },
      contact: dto.contact ?? {},
      address: {
        cityId: dto.address?.cityId
          ? new Types.ObjectId(dto.address.cityId)
          : undefined,
        line: dto.address?.line,
        postalCode: dto.address?.postalCode,
      },
      amenityKeys: dto.amenityKeys ?? [],
      sportIds: dto.sportIds ?? [],
      rules: dto.rules,
      review: {
        status: ClubLifecycleStatus.DRAFT,
        documentMediaIds: [],
      },
    });

    this.audit.log({
      action: AuditAction.CLUB_CREATED,
      actorId: jwt.sub,
      metadata: { clubId: club._id.toString() },
      request,
    });

    await this.events.track({
      eventName: AnalyticsEventName.CLUB_DRAFT_CREATED,
      actor: { userId: jwt.sub, activeRole: jwt.activeRole },
      context: { clubId: club._id },
    });

    return this.toPublic(club);
  }

  async update(
    jwt: JwtUser,
    clubId: string,
    dto: UpdateClubDto,
    request: Request,
  ) {
    const club = await this.requireOwned(jwt, clubId);
    this.assertEditable(club);

    if (dto.identity) {
      if (dto.identity.name !== undefined) {
        club.identity.name = dto.identity.name.trim();
      }
      if (dto.identity.description !== undefined) {
        club.identity.description = dto.identity.description;
      }
      if (dto.identity.coverMediaId !== undefined) {
        club.identity.coverMediaId = dto.identity.coverMediaId
          ? new Types.ObjectId(dto.identity.coverMediaId)
          : undefined;
      }
      if (dto.identity.galleryMediaIds !== undefined) {
        club.identity.galleryMediaIds = dto.identity.galleryMediaIds.map(
          (id) => new Types.ObjectId(id),
        );
      }
      club.markModified('identity');
    }

    if (dto.contact) {
      club.contact = { ...club.contact, ...dto.contact };
      club.markModified('contact');
    }

    if (dto.address) {
      if (dto.address.cityId !== undefined) {
        club.address.cityId = dto.address.cityId
          ? new Types.ObjectId(dto.address.cityId)
          : undefined;
      }
      if (dto.address.line !== undefined) club.address.line = dto.address.line;
      if (dto.address.postalCode !== undefined) {
        club.address.postalCode = dto.address.postalCode;
      }
      club.markModified('address');
    }

    if (dto.amenityKeys !== undefined) club.amenityKeys = dto.amenityKeys;
    if (dto.sportIds !== undefined) club.sportIds = dto.sportIds;
    if (dto.rules !== undefined) club.rules = dto.rules;

    await club.save();

    this.audit.log({
      action: AuditAction.CLUB_UPDATED,
      actorId: jwt.sub,
      metadata: { clubId },
      request,
    });

    return this.toPublic(club);
  }

  async submitForReview(
    jwt: JwtUser,
    clubId: string,
    dto: SubmitClubReviewDto,
    request: Request,
  ) {
    const club = await this.requireOwned(jwt, clubId);
    const status = club.review.status;
    if (
      status !== ClubLifecycleStatus.DRAFT &&
      status !== ClubLifecycleStatus.REJECTED
    ) {
      throw new ConflictException(
        `Cannot submit club in status "${status}"`,
      );
    }
    if (!dto.documentMediaIds.length) {
      throw new BadRequestException('At least one document is required');
    }

    club.review = {
      ...club.review,
      status: ClubLifecycleStatus.PENDING_REVIEW,
      submittedAt: new Date(),
      documentMediaIds: dto.documentMediaIds.map(
        (id) => new Types.ObjectId(id),
      ),
      reviewNote: dto.note,
      reviewedAt: undefined,
      reviewedBy: undefined,
    };
    club.markModified('review');
    await club.save();

    this.audit.log({
      action: AuditAction.CLUB_SUBMITTED,
      actorId: jwt.sub,
      metadata: { clubId },
      request,
    });

    await this.events.track({
      eventName: AnalyticsEventName.CLUB_SUBMITTED_FOR_REVIEW,
      actor: { userId: jwt.sub, activeRole: jwt.activeRole },
      context: { clubId },
    });

    return this.toPublic(club);
  }

  async requireOwned(jwt: JwtUser, clubId: string): Promise<ClubDocument> {
    assertCanMutateAsRole(jwt, Role.CLUB_OWNER);
    const club = await this.clubModel.findById(clubId);
    if (!club) throw new NotFoundException('Club not found');
    if (club.ownerId.toString() !== jwt.sub) {
      throw new ForbiddenException('Not your club');
    }
    return club;
  }

  private assertEditable(club: ClubDocument) {
    const status = club.review.status;
    if (
      status !== ClubLifecycleStatus.DRAFT &&
      status !== ClubLifecycleStatus.REJECTED
    ) {
      throw new ConflictException(
        `Club in status "${status}" cannot be edited until reviewed`,
      );
    }
  }

  toPublic(club: Club | ClubDocument | Record<string, unknown>) {
    const c = club as ClubDocument;
    return {
      id: c._id.toString(),
      ownerId: c.ownerId.toString(),
      identity: {
        name: c.identity?.name,
        description: c.identity?.description ?? null,
        coverMediaId: c.identity?.coverMediaId?.toString() ?? null,
        galleryMediaIds: (c.identity?.galleryMediaIds ?? []).map((id) =>
          id.toString(),
        ),
      },
      contact: c.contact ?? {},
      address: {
        cityId: c.address?.cityId?.toString() ?? null,
        line: c.address?.line ?? null,
        postalCode: c.address?.postalCode ?? null,
      },
      review: {
        status: c.review?.status,
        submittedAt: c.review?.submittedAt ?? null,
        reviewedAt: c.review?.reviewedAt ?? null,
        reviewNote: c.review?.reviewNote ?? null,
        documentMediaIds: (c.review?.documentMediaIds ?? []).map((id) =>
          id.toString(),
        ),
      },
      amenityKeys: c.amenityKeys ?? [],
      sportIds: c.sportIds ?? [],
      rules: c.rules ?? null,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }
}
