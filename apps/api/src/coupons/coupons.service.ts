import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, type ClientSession } from 'mongoose';
import { EntityStatus } from '../common/enums';
import {
  createSearchFilter,
  resolveListSort,
} from '../common/utils/list-query.util';
import {
  Coupon,
  CouponDiscountType,
  CouponDocument,
  CouponRedemption,
  CouponRedemptionDocument,
  CouponUserUsage,
  CouponUserUsageDocument,
} from '../schemas/coupon.schema';
import { Club, ClubDocument } from '../schemas/club.schema';
import {
  CreateCouponDto,
  ListCouponsQueryDto,
  UpdateCouponDto,
} from './dto/coupons.dto';

export type CouponContext = {
  userId?: string;
  clubId?: string;
  amount: number;
};

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name)
    private readonly couponModel: Model<CouponDocument>,
    @InjectModel(CouponRedemption.name)
    private readonly redemptionModel: Model<CouponRedemptionDocument>,
    @InjectModel(CouponUserUsage.name)
    private readonly userUsageModel: Model<CouponUserUsageDocument>,
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,
  ) {}

  // ── Evaluation ─────────────────────────────────────────────────────────

  /** Validate + compute without redeeming (checkout preview). */
  async preview(code: string, ctx: CouponContext) {
    const coupon = await this.findUsable(code, ctx);
    const discount = this.computeDiscount(coupon, ctx.amount);
    return {
      code: coupon.code,
      title: coupon.title ?? null,
      discount,
      payable: Math.max(0, ctx.amount - discount),
    };
  }

  /**
   * Redeem for an order. Idempotent per `contextKey`: retries return the
   * already-recorded discount instead of double-counting.
   */
  async redeem(
    code: string,
    ctx: CouponContext & { contextKey: string },
    session: ClientSession,
  ) {
    const existing = await this.redemptionModel
      .findOne({ contextKey: ctx.contextKey })
      .session(session)
      .lean();
    if (existing) {
      return { discount: existing.discount, idempotent: true as const };
    }

    const coupon = await this.findUsable(code, ctx, session);
    const discount = this.computeDiscount(coupon, ctx.amount);

    try {
      const redemption = new this.redemptionModel({
        couponId: coupon._id,
        userId: ctx.userId ? new Types.ObjectId(ctx.userId) : undefined,
        contextKey: ctx.contextKey,
        amount: ctx.amount,
        discount,
      });
      await redemption.save({ session });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        const raced = await this.redemptionModel
          .findOne({ contextKey: ctx.contextKey })
          .session(session)
          .lean();
        if (raced)
          return { discount: raced.discount, idempotent: true as const };
      }
      throw err;
    }

    const globalLimit = coupon.constraints?.maxRedemptions;
    const global = await this.couponModel.updateOne(
      {
        _id: coupon._id,
        ...(globalLimit ? { redemptionCount: { $lt: globalLimit } } : {}),
      },
      { $inc: { redemptionCount: 1 } },
      { session },
    );
    if (global.modifiedCount !== 1) {
      throw new BadRequestException('Coupon redemption limit reached');
    }

    const perUserLimit = coupon.constraints?.maxPerUser;
    if (perUserLimit && ctx.userId) {
      try {
        const usage = await this.userUsageModel.findOneAndUpdate(
          {
            couponId: coupon._id,
            userId: new Types.ObjectId(ctx.userId),
            count: { $lt: perUserLimit },
          },
          { $inc: { count: 1 } },
          { session, upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
        );
        if (!usage) {
          throw new BadRequestException('You have already used this coupon');
        }
      } catch (err) {
        if ((err as { code?: number }).code === 11000) {
          throw new BadRequestException('You have already used this coupon');
        }
        throw err;
      }
    }
    return { discount, idempotent: false as const };
  }

  private async findUsable(
    code: string,
    ctx: CouponContext,
    session?: ClientSession,
  ): Promise<CouponDocument> {
    const coupon = await this.couponModel
      .findOne({ code: code.trim().toUpperCase() })
      .session(session ?? null);
    if (!coupon || coupon.status !== EntityStatus.ACTIVE) {
      throw new NotFoundException('Coupon not found');
    }

    const now = Date.now();
    const c = coupon.constraints ?? {};
    if (c.validFrom && c.validFrom.getTime() > now) {
      throw new BadRequestException('Coupon is not active yet');
    }
    if (c.validUntil && c.validUntil.getTime() < now) {
      throw new BadRequestException('Coupon has expired');
    }
    if (c.minAmount && ctx.amount < c.minAmount) {
      throw new BadRequestException(
        `Order amount is below coupon minimum (${c.minAmount})`,
      );
    }
    if (
      coupon.clubId &&
      (!ctx.clubId || coupon.clubId.toString() !== ctx.clubId)
    ) {
      throw new BadRequestException('Coupon is not valid for this club');
    }
    if (c.maxRedemptions && coupon.redemptionCount >= c.maxRedemptions) {
      throw new BadRequestException('Coupon redemption limit reached');
    }
    if (c.maxPerUser && ctx.userId) {
      const usage = await this.userUsageModel
        .findOne({
          couponId: coupon._id,
          userId: new Types.ObjectId(ctx.userId),
        })
        .session(session ?? null);
      if ((usage?.count ?? 0) >= c.maxPerUser) {
        throw new BadRequestException('You have already used this coupon');
      }
    }
    return coupon;
  }

  private computeDiscount(coupon: CouponDocument, amount: number): number {
    if (amount <= 0) return 0;
    let discount =
      coupon.discount.type === CouponDiscountType.PERCENT
        ? Math.floor((amount * coupon.discount.value) / 100)
        : coupon.discount.value;
    if (
      coupon.discount.type === CouponDiscountType.PERCENT &&
      coupon.discount.maxAmount
    ) {
      discount = Math.min(discount, coupon.discount.maxAmount);
    }
    return Math.min(discount, amount);
  }

  // ── Admin CRUD ─────────────────────────────────────────────────────────

  async create(dto: CreateCouponDto) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.couponModel.exists({ code });
    if (existing) throw new BadRequestException('Coupon code already exists');

    const coupon = await this.couponModel.create({
      code,
      title: dto.title,
      clubId: dto.clubId ? new Types.ObjectId(dto.clubId) : undefined,
      discount: {
        type: dto.discount.type,
        value: dto.discount.value,
        maxAmount: dto.discount.maxAmount,
      },
      constraints: {
        validFrom: dto.constraints?.validFrom
          ? new Date(dto.constraints.validFrom)
          : undefined,
        validUntil: dto.constraints?.validUntil
          ? new Date(dto.constraints.validUntil)
          : undefined,
        maxRedemptions: dto.constraints?.maxRedemptions,
        maxPerUser: dto.constraints?.maxPerUser,
        minAmount: dto.constraints?.minAmount,
      },
      status: dto.status ?? EntityStatus.ACTIVE,
    });
    return this.toPublic(coupon);
  }

  async list(query: ListCouponsQueryDto) {
    const filter: Record<string, unknown> = {
      ...createSearchFilter(query.search, ['code', 'title']),
    };
    if (query.status) filter.status = { $in: query.status };
    if (query.clubId) filter.clubId = new Types.ObjectId(query.clubId);
    const sort = resolveListSort(
      query,
      {
        code: 'code',
        title: 'title',
        status: 'status',
        discountValue: 'discount.value',
        redemptionCount: 'redemptionCount',
        validFrom: 'constraints.validFrom',
        validUntil: 'constraints.validUntil',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      },
      { createdAt: -1 },
    );
    const items = await this.couponModel.find(filter).sort(sort).limit(200);
    return { items: items.map((c) => this.toPublic(c)) };
  }

  async update(couponId: string, dto: UpdateCouponDto) {
    if (!Types.ObjectId.isValid(couponId)) {
      throw new NotFoundException('Coupon not found');
    }
    const coupon = await this.couponModel.findById(couponId);
    if (!coupon) throw new NotFoundException('Coupon not found');

    if (dto.title !== undefined) coupon.title = dto.title;
    if (dto.status !== undefined) coupon.status = dto.status;
    if (dto.discount !== undefined) {
      coupon.discount = {
        type: dto.discount.type,
        value: dto.discount.value,
        maxAmount: dto.discount.maxAmount,
      };
      coupon.markModified('discount');
    }
    if (dto.constraints !== undefined) {
      coupon.constraints = {
        validFrom: dto.constraints.validFrom
          ? new Date(dto.constraints.validFrom)
          : undefined,
        validUntil: dto.constraints.validUntil
          ? new Date(dto.constraints.validUntil)
          : undefined,
        maxRedemptions: dto.constraints.maxRedemptions,
        maxPerUser: dto.constraints.maxPerUser,
        minAmount: dto.constraints.minAmount,
      };
      coupon.markModified('constraints');
    }
    await coupon.save();
    return this.toPublic(coupon);
  }

  async listForOwner(
    ownerId: string,
    clubId: string,
    query: ListCouponsQueryDto,
  ) {
    await this.requireOwnedClub(ownerId, clubId);
    return this.list({ ...query, clubId });
  }

  async createForOwner(ownerId: string, clubId: string, dto: CreateCouponDto) {
    await this.requireOwnedClub(ownerId, clubId);
    const code = dto.code.trim().toUpperCase();
    const existing = await this.couponModel.findOne({ code });
    if (existing) {
      const expected = this.ownerCreateFingerprint(clubId, dto);
      const actual = this.couponFingerprint(existing);
      if (existing.clubId?.toString() !== clubId || actual !== expected) {
        throw new BadRequestException('Coupon code already exists');
      }
      return this.toPublic(existing);
    }
    try {
      return await this.create({ ...dto, clubId });
    } catch (error: unknown) {
      const winner = await this.couponModel.findOne({ code });
      if (
        winner &&
        winner.clubId?.toString() === clubId &&
        this.couponFingerprint(winner) ===
          this.ownerCreateFingerprint(clubId, dto)
      ) {
        return this.toPublic(winner);
      }
      throw error;
    }
  }

  async updateForOwner(
    ownerId: string,
    clubId: string,
    couponId: string,
    dto: UpdateCouponDto,
  ) {
    await this.requireOwnedClub(ownerId, clubId);
    if (!Types.ObjectId.isValid(couponId)) {
      throw new NotFoundException('Coupon not found');
    }
    const coupon = await this.couponModel.findOne({
      _id: new Types.ObjectId(couponId),
      clubId: new Types.ObjectId(clubId),
    });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return this.update(couponId, dto);
  }

  private async requireOwnedClub(ownerId: string, clubId: string) {
    if (!Types.ObjectId.isValid(ownerId) || !Types.ObjectId.isValid(clubId)) {
      throw new ForbiddenException('Club ownership required');
    }
    const owned = await this.clubModel.exists({
      _id: new Types.ObjectId(clubId),
      ownerId: new Types.ObjectId(ownerId),
    });
    if (!owned) throw new ForbiddenException('Club ownership required');
  }

  private ownerCreateFingerprint(clubId: string, dto: CreateCouponDto) {
    return JSON.stringify({
      clubId,
      title: dto.title ?? null,
      discount: {
        type: dto.discount.type,
        value: dto.discount.value,
        ...(dto.discount.maxAmount !== undefined
          ? { maxAmount: dto.discount.maxAmount }
          : {}),
      },
      constraints: {
        ...(dto.constraints?.validFrom
          ? { validFrom: new Date(dto.constraints.validFrom).toISOString() }
          : {}),
        ...(dto.constraints?.validUntil
          ? { validUntil: new Date(dto.constraints.validUntil).toISOString() }
          : {}),
        ...(dto.constraints?.maxRedemptions !== undefined
          ? { maxRedemptions: dto.constraints.maxRedemptions }
          : {}),
        ...(dto.constraints?.maxPerUser !== undefined
          ? { maxPerUser: dto.constraints.maxPerUser }
          : {}),
        ...(dto.constraints?.minAmount !== undefined
          ? { minAmount: dto.constraints.minAmount }
          : {}),
      },
      status: dto.status ?? EntityStatus.ACTIVE,
    });
  }

  private couponFingerprint(coupon: CouponDocument) {
    return JSON.stringify({
      clubId: coupon.clubId?.toString() ?? null,
      title: coupon.title ?? null,
      discount: {
        type: coupon.discount.type,
        value: coupon.discount.value,
        ...(coupon.discount.maxAmount !== undefined
          ? { maxAmount: coupon.discount.maxAmount }
          : {}),
      },
      constraints: {
        ...(coupon.constraints.validFrom
          ? { validFrom: coupon.constraints.validFrom.toISOString() }
          : {}),
        ...(coupon.constraints.validUntil
          ? { validUntil: coupon.constraints.validUntil.toISOString() }
          : {}),
        ...(coupon.constraints.maxRedemptions !== undefined
          ? { maxRedemptions: coupon.constraints.maxRedemptions }
          : {}),
        ...(coupon.constraints.maxPerUser !== undefined
          ? { maxPerUser: coupon.constraints.maxPerUser }
          : {}),
        ...(coupon.constraints.minAmount !== undefined
          ? { minAmount: coupon.constraints.minAmount }
          : {}),
      },
      status: coupon.status,
    });
  }

  private toPublic(coupon: CouponDocument) {
    return {
      id: coupon._id.toString(),
      code: coupon.code,
      title: coupon.title ?? null,
      clubId: coupon.clubId?.toString() ?? null,
      discount: {
        type: coupon.discount.type,
        value: coupon.discount.value,
        maxAmount: coupon.discount.maxAmount ?? null,
      },
      constraints: {
        validFrom: coupon.constraints?.validFrom ?? null,
        validUntil: coupon.constraints?.validUntil ?? null,
        maxRedemptions: coupon.constraints?.maxRedemptions ?? null,
        maxPerUser: coupon.constraints?.maxPerUser ?? null,
        minAmount: coupon.constraints?.minAmount ?? null,
      },
      status: coupon.status,
      redemptionCount: coupon.redemptionCount,
      createdAt: coupon.createdAt,
    };
  }
}
