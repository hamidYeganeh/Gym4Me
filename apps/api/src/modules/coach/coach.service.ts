import { Inject, Injectable } from "@nestjs/common";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { ApiError } from "../../common/api-error.js";
import { AuditService } from "../audit/audit.service.js";
import { flattenPatch, toStorage } from "../organization/entity-mapper.js";

@Injectable()
export class CoachService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly audit: AuditService,
  ) {}
  async me(userId: string) {
    return (
      (await this.models.CoachProfile.findOne({ userId: objectIdFrom(userId) }).lean()) ?? null
    );
  }
  async update(userId: string, input: Record<string, unknown>, requestId: string) {
    const before = await this.me(userId);
    const mapped = toStorage(input) as Record<string, unknown>;
    if ("specialtyIds" in mapped) {
      mapped.specialties = mapped.specialtyIds;
      delete mapped.specialtyIds;
    }
    const update = flattenPatch(mapped);
    update.updatedBy = objectIdFrom(userId);
    const result = await this.models.CoachProfile.findOneAndUpdate(
      { userId: objectIdFrom(userId) },
      {
        $set: update,
        $setOnInsert: {
          userId: objectIdFrom(userId),
          status: "draft",
          createdBy: objectIdFrom(userId),
        },
      },
      { returnDocument: "after", upsert: true },
    ).lean();
    await this.audit.record({
      actorUserId: userId,
      action: "coach.profile.updated",
      entityType: "coach_profile",
      entityId: String((result as any)._id),
      before,
      after: result,
      requestId,
    });
    return result;
  }
  async submit(userId: string, requestId: string) {
    const profile = await this.models.CoachProfile.findOneAndUpdate(
      { userId: objectIdFrom(userId) },
      {
        $set: {
          status: "pending_verification",
          "verification.status": "pending",
          "verification.submittedAt": new Date(),
          updatedBy: objectIdFrom(userId),
        },
      },
      { returnDocument: "after" },
    ).lean();
    if (!profile)
      throw new ApiError("COACH_PROFILE_NOT_FOUND", "ابتدا پروفایل مربی را تکمیل کنید.", 404);
    await this.audit.record({
      actorUserId: userId,
      action: "coach.profile.submitted",
      entityType: "coach_profile",
      entityId: String((profile as any)._id),
      after: profile,
      requestId,
    });
    return profile;
  }
  async list(query: any, admin = false) {
    const filter: any = admin ? {} : { status: "active", "verification.status": "verified" };
    if (query.specialty_id) filter.specialties = objectIdFrom(query.specialty_id);
    if (query.service_mode) filter.serviceModes = query.service_mode;
    if (query.gender) filter["professional.gender"] = query.gender;
    if (query.city)
      filter.locations = {
        $elemMatch: { city: { $regex: query.city, $options: "i" }, status: "active" },
      };
    if (query.search)
      filter.$or = [
        { "professional.displayName": { $regex: query.search, $options: "i" } },
        { "professional.headline.fa": { $regex: query.search, $options: "i" } },
      ];
    if (query.min_price !== undefined || query.max_price !== undefined) {
      const priced = await this.models.Offering.distinct("provider.coachProfileId", {
        status: "active",
        "provider.type": "coach",
        "pricing.baseAmount": {
          ...(query.min_price !== undefined ? { $gte: query.min_price } : {}),
          ...(query.max_price !== undefined ? { $lte: query.max_price } : {}),
        },
      });
      filter._id = { $in: priced };
    }
    const [items, total] = await Promise.all([
      this.models.CoachProfile.find(filter)
        .sort({ "verification.reviewedAt": -1, "professional.displayName": 1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      this.models.CoachProfile.countDocuments(filter),
    ]);
    return { items: await this.withOfferings(items as any[]), total };
  }
  private async withOfferings(items: any[]) {
    if (!items.length) return items;
    const offerings = (await this.models.Offering.find({
      "provider.coachProfileId": { $in: items.map((x) => x._id) },
      status: "active",
    })
      .sort({ "profile.name": 1 })
      .lean()) as any[];
    return items.map((item) => ({
      ...item,
      offerings: offerings.filter((x) => String(x.provider?.coachProfileId) === String(item._id)),
    }));
  }
  async publicDetail(id: string) {
    const item = await this.models.CoachProfile.findOne({
      _id: objectIdFrom(id),
      status: "active",
      "verification.status": "verified",
    }).lean();
    if (!item) throw new ApiError("COACH_NOT_FOUND", "مربی فعال پیدا نشد.", 404);
    return (await this.withOfferings([item as any]))[0];
  }
  async myOfferings(userId: string) {
    const profile = (await this.me(userId)) as any;
    if (!profile) return [];
    return this.models.Offering.find({
      "provider.coachProfileId": profile._id,
      status: { $ne: "archived" },
    })
      .sort({ createdAt: -1 })
      .lean();
  }
  async mySettlements(userId: string) {
    const profile = (await this.me(userId)) as any;
    if (!profile) return [];
    return this.models.Settlement.find({
      "beneficiary.type": "coach",
      "beneficiary.id": profile._id,
    })
      .sort({ createdAt: -1 })
      .lean();
  }
  async createOffering(userId: string, input: any, requestId: string) {
    const profile = (await this.models.CoachProfile.findOne({
      userId: objectIdFrom(userId),
      status: "active",
      "verification.status": "verified",
    }).lean()) as any;
    if (!profile)
      throw new ApiError(
        "COACH_NOT_VERIFIED",
        "برای ساخت خدمت باید پروفایل مربی تأیید شده باشد.",
        403,
      );
    const branch = (await this.models.Branch.findOne({
      _id: objectIdFrom(input.branch_id),
      status: "active",
    }).lean()) as any;
    if (!branch) throw new ApiError("BRANCH_NOT_FOUND", "شعبه فعال پیدا نشد.", 404);
    const club = (await this.models.Club.findOne({
      _id: branch.clubId,
      status: "active",
    }).lean()) as any;
    if (!club) throw new ApiError("CLUB_NOT_FOUND", "باشگاه فعال پیدا نشد.", 404);
    const resource = await this.models.Resource.findOne({
      _id: objectIdFrom(input.resource_id),
      branchId: branch._id,
      status: "active",
    }).lean();
    if (!resource)
      throw new ApiError("RESOURCE_NOT_FOUND", "منبع فعال انتخاب‌شده معتبر نیست.", 422);
    const item = await this.models.Offering.create({
      organizationId: club.organizationId,
      branchIds: [branch._id],
      resourceRequirements: [
        { resourceId: objectIdFrom(input.resource_id), quantity: 1, mode: "required" },
      ],
      provider: { type: "coach", coachProfileId: profile._id, coachUserId: objectIdFrom(userId) },
      revenueShare: { coachPercentageBps: input.coach_percentage_bps },
      profile: {
        name: input.profile.name,
        slug: input.profile.slug,
        description: input.profile.description,
        sport: input.profile.sport,
        serviceMode: input.profile.service_mode,
        type: input.profile.service_mode === "online" ? "online_session" : "private_coaching",
      },
      pricing: {
        currency: input.pricing.currency,
        baseAmount: input.pricing.base_amount,
        pricingMode: "per_booking",
        taxIncluded: false,
      },
      capacity: {
        mode: input.capacity.maximum === 1 ? "exclusive" : "shared",
        minimum: 1,
        maximum: input.capacity.maximum,
      },
      bookingSettings: {
        durationMinutes: input.booking_settings.duration_minutes,
        bookingWindowDays: input.booking_settings.booking_window_days,
        minimumAdvanceMinutes: input.booking_settings.minimum_advance_minutes,
        cancellationWindowMinutes: 720,
        allowRecurring: true,
        allowGroup: input.capacity.maximum > 1,
        allowFamily: input.capacity.maximum > 1,
      },
      status: "active",
      createdBy: objectIdFrom(userId),
    });
    await this.audit.record({
      actorUserId: userId,
      action: "coach.offering.created",
      entityType: "offering",
      entityId: String(item._id),
      organizationId: String(club.organizationId),
      after: item.toObject(),
      requestId,
    });
    return item.toObject();
  }
  async verify(
    actorId: string,
    id: string,
    input: { status: string; reason?: string | undefined },
    requestId: string,
  ) {
    const active = input.status === "verified";
    const item = await this.models.CoachProfile.findByIdAndUpdate(
      objectIdFrom(id),
      {
        $set: {
          status: active
            ? "active"
            : input.status === "rejected"
              ? "rejected"
              : "pending_verification",
          "verification.status": input.status,
          "verification.reason": input.reason,
          "verification.reviewedAt": new Date(),
          "verification.reviewedBy": objectIdFrom(actorId),
          updatedBy: objectIdFrom(actorId),
        },
      },
      { returnDocument: "after" },
    ).lean();
    if (!item) throw new ApiError("COACH_NOT_FOUND", "پروفایل مربی پیدا نشد.", 404);
    await this.audit.record({
      actorUserId: actorId,
      action: `coach.verification.${input.status}`,
      entityType: "coach_profile",
      entityId: id,
      after: item,
      requestId,
    });
    return item;
  }
}
