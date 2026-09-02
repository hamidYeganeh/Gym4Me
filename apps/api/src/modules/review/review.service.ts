import { Inject, Injectable } from "@nestjs/common";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { PERMISSIONS } from "../../security/rbac.js";
import { ApiError } from "../../common/api-error.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { AuditService } from "../audit/audit.service.js";
import { toStorage } from "../organization/entity-mapper.js";
import { OrganizationAccessService } from "../organization/organization-access.service.js";

@Injectable()
export class ReviewService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly access: OrganizationAccessService,
    private readonly audit: AuditService,
  ) {}

  private async resolveSubject(booking: any, subject: { type: string; id: string }) {
    const offering = (await this.models.Offering.findById(booking.offeringId).lean()) as any;
    const branch = (await this.models.Branch.findById(booking.branchId).lean()) as any;
    const club = branch ? ((await this.models.Club.findById(branch.clubId).lean()) as any) : null;
    const expected: Record<string, string> = {
      offering: String(booking.offeringId),
      branch: String(booking.branchId),
      club: String(club?._id ?? ""),
      coach: String(offering?.provider?.coachProfileId ?? ""),
    };
    if (!expected[subject.type] || expected[subject.type] !== subject.id)
      throw new ApiError("REVIEW_SUBJECT_INVALID", "موضوع نظر با رزرو انجام‌شده مرتبط نیست.", 422);
    return String(booking.organizationId ?? club?.organizationId ?? offering?.organizationId);
  }

  async create(userId: string, input: any, requestId: string) {
    const booking = (await this.models.Booking.findOne({
      _id: objectIdFrom(input.booking_id),
      customerUserId: objectIdFrom(userId),
      status: "completed",
    }).lean()) as any;
    if (!booking)
      throw new ApiError(
        "REVIEW_BOOKING_INVALID",
        "فقط پس از تکمیل رزرو می‌توانید نظر ثبت کنید.",
        409,
      );
    const organizationId = await this.resolveSubject(booking, input.subject);
    try {
      const item = await this.models.Review.create({
        authorUserId: objectIdFrom(userId),
        subject: {
          type: input.subject.type,
          id: objectIdFrom(input.subject.id),
          organizationId: objectIdFrom(organizationId),
        },
        bookingId: booking._id,
        rating: input.rating,
        content: input.content,
        moderation: { reports: [], history: [] },
        status: "pending",
        createdBy: objectIdFrom(userId),
      });
      await this.audit.record({
        actorUserId: userId,
        action: "review.created",
        entityType: "review",
        entityId: String(item._id),
        organizationId,
        after: item.toObject(),
        requestId,
      });
      return item.toObject();
    } catch (error: any) {
      if (error?.code === 11000)
        throw new ApiError(
          "REVIEW_ALREADY_EXISTS",
          "برای این رزرو و موضوع قبلاً نظر ثبت کرده‌اید.",
          409,
        );
      throw error;
    }
  }

  async update(userId: string, id: string, input: any, requestId: string) {
    const before = (await this.models.Review.findOne({
      _id: objectIdFrom(id),
      authorUserId: objectIdFrom(userId),
    }).lean()) as any;
    if (!before) throw new ApiError("REVIEW_NOT_FOUND", "نظر پیدا نشد.", 404);
    if (!["pending", "rejected"].includes(before.status))
      throw new ApiError("REVIEW_LOCKED", "این نظر در وضعیت قابل ویرایش نیست.", 409);
    const item = await this.models.Review.findByIdAndUpdate(
      id,
      {
        $set: {
          rating: input.rating,
          content: input.content,
          status: "pending",
          updatedBy: objectIdFrom(userId),
        },
      },
      { returnDocument: "after" },
    ).lean();
    await this.audit.record({
      actorUserId: userId,
      action: "review.updated",
      entityType: "review",
      entityId: id,
      organizationId: String(before.subject.organizationId),
      before,
      after: item,
      requestId,
    });
    return item;
  }

  async mine(userId: string) {
    return this.models.Review.find({ authorUserId: objectIdFrom(userId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  private async authorProfiles(items: any[]) {
    const profiles = (await this.models.UserProfile.find({
      userId: { $in: items.map((item) => item.authorUserId) },
    }).lean()) as any[];
    return items.map((item) => ({
      ...item,
      author: profiles.find((profile) => String(profile.userId) === String(item.authorUserId))
        ?.identity ?? { displayName: "کاربر Gym4Me" },
    }));
  }

  async publicList(query: any) {
    const filter = {
      "subject.type": query.subject_type,
      "subject.id": objectIdFrom(query.subject_id),
      status: "active",
    };
    const [items, total, summary] = await Promise.all([
      this.models.Review.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      this.models.Review.countDocuments(filter),
      this.models.Review.aggregate([
        { $match: filter },
        { $group: { _id: null, average: { $avg: "$rating.overall" }, count: { $sum: 1 } } },
      ]),
    ]);
    return {
      items: await this.authorProfiles(items as any[]),
      total,
      summary: summary[0] ?? { average: 0, count: 0 },
    };
  }

  async organizationList(actor: string, organizationId: string, query: any) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.ORGANIZATION_REVIEWS_MANAGE,
    );
    const filter: any = {
      "subject.organizationId": objectIdFrom(organizationId),
      ...(query.status ? { status: query.status } : {}),
    };
    const [items, total] = await Promise.all([
      this.models.Review.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      this.models.Review.countDocuments(filter),
    ]);
    return { items: await this.authorProfiles(items as any[]), total };
  }

  async reply(actor: string, organizationId: string, id: string, input: any, requestId: string) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.ORGANIZATION_REVIEWS_MANAGE,
    );
    const item = await this.models.Review.findOneAndUpdate(
      {
        _id: objectIdFrom(id),
        "subject.organizationId": objectIdFrom(organizationId),
        status: "active",
      },
      {
        $set: {
          reply: { body: input.body, repliedAt: new Date(), repliedBy: objectIdFrom(actor) },
          updatedBy: objectIdFrom(actor),
        },
      },
      { returnDocument: "after" },
    ).lean();
    if (!item)
      throw new ApiError("REVIEW_NOT_REPLYABLE", "نظر فعال مرتبط با این سازمان پیدا نشد.", 404);
    await this.audit.record({
      actorUserId: actor,
      action: "review.replied",
      entityType: "review",
      entityId: id,
      organizationId,
      after: item,
      requestId,
    });
    return item;
  }

  async report(userId: string, id: string, input: any) {
    const review = (await this.models.Review.findOne({
      _id: objectIdFrom(id),
      status: "active",
    }).lean()) as any;
    if (!review) throw new ApiError("REVIEW_NOT_FOUND", "نظر فعال پیدا نشد.", 404);
    if (String(review.authorUserId) === userId)
      throw new ApiError("REVIEW_SELF_REPORT", "نمی‌توانید نظر خودتان را گزارش کنید.", 409);
    const already = (review.moderation?.reports ?? []).some(
      (item: any) => String(item.userId) === userId,
    );
    if (already) return review;
    return this.models.Review.findByIdAndUpdate(
      id,
      {
        $push: {
          "moderation.reports": {
            userId: objectIdFrom(userId),
            ...(toStorage(input) as Record<string, unknown>),
            reportedAt: new Date(),
          },
        },
      },
      { returnDocument: "after" },
    ).lean();
  }

  async adminList(query: any) {
    const filter: any = { ...(query.status ? { status: query.status } : {}) };
    const [items, total] = await Promise.all([
      this.models.Review.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      this.models.Review.countDocuments(filter),
    ]);
    return { items: await this.authorProfiles(items as any[]), total };
  }

  async moderate(actor: string, id: string, input: any, requestId: string) {
    const item = (await this.models.Review.findById(id)) as any;
    if (!item) throw new ApiError("REVIEW_NOT_FOUND", "نظر پیدا نشد.", 404);
    const before = item.toObject();
    const statuses: Record<string, string> = {
      approve: "active",
      reject: "rejected",
      hide: "hidden",
      restore: "active",
    };
    item.status = statuses[input.decision];
    item.moderation = {
      ...(item.moderation ?? {}),
      decision: input.decision,
      note: input.note,
      reviewedAt: new Date(),
      reviewedBy: objectIdFrom(actor),
      history: [
        ...(item.moderation?.history ?? []),
        {
          decision: input.decision,
          note: input.note,
          reviewedAt: new Date(),
          reviewedBy: objectIdFrom(actor),
        },
      ],
    };
    item.updatedBy = objectIdFrom(actor);
    await item.save();
    await this.audit.record({
      actorUserId: actor,
      action: `review.moderation.${input.decision}`,
      entityType: "review",
      entityId: id,
      organizationId: String(item.subject.organizationId),
      before,
      after: item.toObject(),
      requestId,
    });
    return item.toObject();
  }
}
