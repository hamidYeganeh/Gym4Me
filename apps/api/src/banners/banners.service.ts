import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Request } from 'express';
import { Model, Types } from 'mongoose';
import type { QueryFilter } from 'mongoose';
import { AuditService } from '../audit/audit.service';
import {
  AuditAction,
  BannerLinkKind,
  BannerPlacement,
  PublishStatus,
} from '../common/enums';
import {
  paginatedResult,
  resolvePageSize,
} from '../common/utils/pagination.util';
import { MediaService } from '../media/media.service';
import { Banner, BannerDocument } from '../schemas/banner.schema';
import {
  AdminListBannersQueryDto,
  BannerScheduleDto,
  BannerSlideDto,
  CreateBannerDto,
  UpdateBannerDto,
} from './dto/admin-banner.dto';
import { ListBannersQueryDto } from './dto/banner.dto';

type LeanBanner = {
  _id: Types.ObjectId;
  title: string;
  placement: string;
  slides: {
    mediaId: Types.ObjectId;
    linkKind: string;
    linkUrl?: string;
    alt?: string;
  }[];
  publishStatus: string;
  schedule?: { startsAt?: Date; endsAt?: Date };
  order: number;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class BannersService {
  constructor(
    @InjectModel(Banner.name)
    private readonly bannerModel: Model<BannerDocument>,
    private readonly media: MediaService,
    private readonly audit: AuditService,
  ) {}

  /** Published banners for one placement, within schedule window. */
  async listActive(query: ListBannersQueryDto) {
    const now = new Date();
    const items = await this.bannerModel
      .find({
        placement: query.placement,
        publishStatus: PublishStatus.PUBLISHED,
        $and: [
          {
            $or: [
              { 'schedule.startsAt': { $exists: false } },
              { 'schedule.startsAt': null },
              { 'schedule.startsAt': { $lte: now } },
            ],
          },
          {
            $or: [
              { 'schedule.endsAt': { $exists: false } },
              { 'schedule.endsAt': null },
              { 'schedule.endsAt': { $gte: now } },
            ],
          },
        ],
      })
      .sort({ order: 1, updatedAt: -1 })
      .lean();

    return items.map((item) => this.toPublic(item));
  }

  async adminList(query: AdminListBannersQueryDto) {
    const filter: QueryFilter<BannerDocument> = {};
    if (query.placement) filter.placement = query.placement;
    if (query.publishStatus) filter.publishStatus = query.publishStatus;
    if (query.search) {
      const pattern = new RegExp(
        query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i',
      );
      filter.title = pattern;
    }

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.bannerModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.bannerModel.countDocuments(filter),
    ]);

    return paginatedResult(
      items.map((item) => this.toAdmin(item)),
      total,
      page,
      pageSize,
    );
  }

  async adminGet(id: string) {
    const item = await this.findBanner(id);
    return this.toAdmin(item.toObject());
  }

  async create(dto: CreateBannerDto, adminId: string, request: Request) {
    await this.assertSlides(dto.slides);
    const schedule = this.normalizeSchedule(dto.schedule);

    const item = await this.bannerModel.create({
      title: dto.title,
      placement: dto.placement,
      slides: dto.slides.map((slide) => this.toSlide(slide)),
      publishStatus: dto.publishStatus ?? PublishStatus.DRAFT,
      schedule,
      order: dto.order ?? 0,
      updatedBy: new Types.ObjectId(adminId),
    });

    this.audit.log({
      action: AuditAction.BANNER_CREATED,
      actorId: adminId,
      metadata: { bannerId: item._id.toString(), placement: item.placement },
      request,
    });

    return this.toAdmin(item.toObject());
  }

  async update(
    id: string,
    dto: UpdateBannerDto,
    adminId: string,
    request: Request,
  ) {
    const item = await this.findBanner(id);

    if (dto.slides !== undefined) {
      await this.assertSlides(dto.slides);
      item.slides = dto.slides.map((slide) => this.toSlide(slide));
    }
    if (dto.title !== undefined) item.title = dto.title;
    if (dto.placement !== undefined) item.placement = dto.placement;
    if (dto.publishStatus !== undefined) item.publishStatus = dto.publishStatus;
    if (dto.schedule !== undefined) {
      item.schedule = this.normalizeSchedule(dto.schedule);
    }
    if (dto.order !== undefined) item.order = dto.order;

    item.updatedBy = new Types.ObjectId(adminId);
    await item.save();

    this.audit.log({
      action: AuditAction.BANNER_UPDATED,
      actorId: adminId,
      metadata: { bannerId: item._id.toString(), placement: item.placement },
      request,
    });

    return this.toAdmin(item.toObject());
  }

  async remove(id: string, adminId: string, request: Request) {
    const item = await this.findBanner(id);
    await item.deleteOne();

    this.audit.log({
      action: AuditAction.BANNER_DELETED,
      actorId: adminId,
      metadata: { bannerId: item._id.toString(), placement: item.placement },
      request,
    });

    return { deleted: true };
  }

  private async findBanner(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Banner not found');
    }
    const item = await this.bannerModel.findById(id);
    if (!item) throw new NotFoundException('Banner not found');
    return item;
  }

  private async assertSlides(slides: BannerSlideDto[]) {
    for (const slide of slides) {
      const linkKind = slide.linkKind ?? BannerLinkKind.NONE;
      if (linkKind !== BannerLinkKind.NONE && !slide.linkUrl?.trim()) {
        throw new BadRequestException(
          'linkUrl is required when linkKind is not none',
        );
      }
      if (
        linkKind === BannerLinkKind.EXTERNAL &&
        !/^https?:\/\//i.test(slide.linkUrl ?? '')
      ) {
        throw new BadRequestException(
          'External banner links must be absolute http(s) URLs',
        );
      }
      if (linkKind === BannerLinkKind.INTERNAL) {
        const url = slide.linkUrl?.trim() ?? '';
        if (!url.startsWith('/')) {
          throw new BadRequestException(
            'Internal banner links must be app-relative paths starting with /',
          );
        }
      }
    }
    await Promise.all(
      slides.map((slide) => this.media.assertExists(slide.mediaId)),
    );
  }

  private toSlide(slide: BannerSlideDto) {
    const linkKind = slide.linkKind ?? BannerLinkKind.NONE;
    return {
      mediaId: new Types.ObjectId(slide.mediaId),
      linkKind,
      linkUrl:
        linkKind === BannerLinkKind.NONE ? undefined : slide.linkUrl?.trim(),
      alt: slide.alt?.trim() || undefined,
    };
  }

  private normalizeSchedule(schedule?: BannerScheduleDto) {
    const startsAt = schedule?.startsAt
      ? new Date(schedule.startsAt)
      : undefined;
    const endsAt = schedule?.endsAt ? new Date(schedule.endsAt) : undefined;
    if (startsAt && endsAt && startsAt > endsAt) {
      throw new BadRequestException(
        'schedule.startsAt must be before schedule.endsAt',
      );
    }
    return { startsAt, endsAt };
  }

  private toPublic(doc: LeanBanner) {
    return {
      id: doc._id.toString(),
      placement: doc.placement as BannerPlacement,
      slides: doc.slides.map((slide) => ({
        mediaId: slide.mediaId.toString(),
        linkKind: slide.linkKind as BannerLinkKind,
        linkUrl: slide.linkUrl ?? null,
        alt: slide.alt ?? null,
      })),
    };
  }

  private toAdmin(doc: LeanBanner) {
    return {
      ...this.toPublic(doc),
      title: doc.title,
      publishStatus: doc.publishStatus as PublishStatus,
      schedule: {
        startsAt: doc.schedule?.startsAt?.toISOString() ?? null,
        endsAt: doc.schedule?.endsAt?.toISOString() ?? null,
      },
      order: doc.order,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
