import { Inject, Injectable } from "@nestjs/common";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { ApiError } from "../../common/api-error.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { AuditService } from "../audit/audit.service.js";
import { flattenPatch, toStorage } from "../organization/entity-mapper.js";

@Injectable()
export class CoachingService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly audit: AuditService,
  ) {}

  async request(athleteUserId: string, input: any, requestId: string) {
    const coach = (await this.models.CoachProfile.findOne({
      _id: objectIdFrom(input.coach_profile_id),
      status: "active",
      "verification.status": "verified",
    }).lean()) as any;
    if (!coach) throw new ApiError("COACH_NOT_FOUND", "مربی تأییدشده پیدا نشد.", 404);
    if (String(coach.userId) === athleteUserId)
      throw new ApiError("COACHING_SELF_REQUEST", "امکان ثبت درخواست برای خودتان وجود ندارد.", 409);
    const existing = (await this.models.CoachingRelationship.findOne({
      coachProfileId: coach._id,
      athleteUserId: objectIdFrom(athleteUserId),
    })) as any;
    let item: any;
    if (existing) {
      if (["requested", "active", "paused"].includes(existing.status)) return existing.toObject();
      existing.profile = input.profile;
      existing.status = "requested";
      existing.lifecycle = { requestedAt: new Date(), initiatedBy: objectIdFrom(athleteUserId) };
      existing.updatedBy = objectIdFrom(athleteUserId);
      await existing.save();
      item = existing;
    } else {
      item = await this.models.CoachingRelationship.create({
        coachProfileId: coach._id,
        coachUserId: coach.userId,
        athleteUserId: objectIdFrom(athleteUserId),
        profile: input.profile,
        lifecycle: { requestedAt: new Date(), initiatedBy: objectIdFrom(athleteUserId) },
        status: "requested",
        createdBy: objectIdFrom(athleteUserId),
      });
    }
    await this.audit.record({
      actorUserId: athleteUserId,
      action: "coaching.relationship.requested",
      entityType: "coaching_relationship",
      entityId: String(item._id),
      after: item.toObject(),
      requestId,
    });
    return item.toObject();
  }

  async mine(userId: string) {
    const relationships = (await this.models.CoachingRelationship.find({
      $or: [{ athleteUserId: objectIdFrom(userId) }, { coachUserId: objectIdFrom(userId) }],
      status: { $ne: "archived" },
    })
      .sort({ updatedAt: -1 })
      .lean()) as any[];
    const [athletes = [], coaches = []] = (await Promise.all([
      this.models.UserProfile.find({
        userId: { $in: relationships.map((item) => item.athleteUserId) },
      }).lean(),
      this.models.CoachProfile.find({
        _id: { $in: relationships.map((item) => item.coachProfileId) },
      }).lean(),
    ])) as any[][];
    return relationships.map((item) => ({
      ...item,
      perspective: String(item.coachUserId) === userId ? "coach" : "athlete",
      athlete: athletes.find((profile) => String(profile.userId) === String(item.athleteUserId)),
      coach: coaches.find((profile) => String(profile._id) === String(item.coachProfileId)),
    }));
  }

  private async relationship(actorUserId: string, id: string) {
    const item = (await this.models.CoachingRelationship.findById(objectIdFrom(id))) as any;
    if (!item)
      throw new ApiError("COACHING_RELATIONSHIP_NOT_FOUND", "ارتباط مربی و شاگرد پیدا نشد.", 404);
    if (![String(item.coachUserId), String(item.athleteUserId)].includes(actorUserId))
      throw new ApiError("COACHING_RELATIONSHIP_FORBIDDEN", "به این ارتباط دسترسی ندارید.", 403);
    return item;
  }

  async status(actorUserId: string, id: string, input: any, requestId: string) {
    const item = await this.relationship(actorUserId, id);
    const isCoach = String(item.coachUserId) === actorUserId;
    const allowed = isCoach ? ["active", "rejected", "paused", "ended"] : ["cancelled", "ended"];
    if (!allowed.includes(input.status))
      throw new ApiError(
        "COACHING_TRANSITION_FORBIDDEN",
        "این تغییر وضعیت برای نقش شما مجاز نیست.",
        403,
      );
    if (input.status === "active" && item.status !== "requested")
      throw new ApiError("COACHING_TRANSITION_INVALID", "فقط درخواست جدید قابل پذیرش است.", 409);
    item.status = input.status;
    item.lifecycle = {
      ...(item.lifecycle ?? {}),
      [`${input.status}At`]: new Date(),
      changedBy: objectIdFrom(actorUserId),
      ...(input.reason ? { reason: input.reason } : {}),
    };
    item.updatedBy = objectIdFrom(actorUserId);
    await item.save();
    await this.audit.record({
      actorUserId,
      action: `coaching.relationship.${input.status}`,
      entityType: "coaching_relationship",
      entityId: id,
      after: item.toObject(),
      requestId,
    });
    return item.toObject();
  }

  async patch(actorUserId: string, id: string, input: any) {
    const item = await this.relationship(actorUserId, id);
    if (String(item.coachUserId) !== actorUserId)
      throw new ApiError("COACHING_COACH_ONLY", "این بخش فقط در دسترس مربی است.", 403);
    if (!["active", "paused"].includes(item.status))
      throw new ApiError("COACHING_RELATIONSHIP_INACTIVE", "ارتباط مربی‌گری فعال نیست.", 409);
    const update = flattenPatch(toStorage(input) as any);
    return this.models.CoachingRelationship.findByIdAndUpdate(
      item._id,
      { $set: { ...update, updatedBy: objectIdFrom(actorUserId) } },
      { returnDocument: "after" },
    ).lean();
  }

  async messages(actorUserId: string, id: string) {
    await this.relationship(actorUserId, id);
    return this.models.CoachingMessage.find({ relationshipId: objectIdFrom(id), status: "sent" })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();
  }

  async send(actorUserId: string, id: string, text: string) {
    const relationship = await this.relationship(actorUserId, id);
    if (!["active", "paused"].includes(relationship.status))
      throw new ApiError(
        "COACHING_RELATIONSHIP_INACTIVE",
        "ارسال پیام فقط در ارتباط فعال ممکن است.",
        409,
      );
    return (
      await this.models.CoachingMessage.create({
        relationshipId: relationship._id,
        senderUserId: objectIdFrom(actorUserId),
        content: { text },
        delivery: { createdAt: new Date() },
        status: "sent",
        createdBy: objectIdFrom(actorUserId),
      })
    ).toObject();
  }
}
