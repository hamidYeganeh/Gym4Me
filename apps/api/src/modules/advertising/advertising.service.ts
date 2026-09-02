import { Inject, Injectable } from "@nestjs/common";
import { createHmac, timingSafeEqual } from "node:crypto";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { PERMISSIONS } from "../../security/rbac.js";
import { ApiError } from "../../common/api-error.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { AuditService } from "../audit/audit.service.js";
import { flattenPatch, toStorage } from "../organization/entity-mapper.js";
import { OrganizationAccessService } from "../organization/organization-access.service.js";
import { appConfig } from "../../config/app.config.js";

@Injectable()
export class AdvertisingService {
  private readonly trackingSecret = appConfig().JWT_ACCESS_SECRET;

  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly access: OrganizationAccessService,
    private readonly audit: AuditService,
  ) {}

  private async organization(actor: string, organizationId: string) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.ORGANIZATION_ADVERTISING_MANAGE,
    );
    const organization = await this.models.Organization.exists({
      _id: objectIdFrom(organizationId),
      status: { $ne: "archived" },
    });
    if (!organization) throw new ApiError("ORGANIZATION_NOT_FOUND", "سازمان پیدا نشد.", 404);
  }

  private async account(organizationId: string, actor: string) {
    const existing = await this.models.AdAccount.findOne({
      "owner.organizationId": objectIdFrom(organizationId),
    });
    if (existing) return existing;
    try {
      return await this.models.AdAccount.create({
        owner: { type: "organization", organizationId: objectIdFrom(organizationId) },
        billing: { currency: "IRR", mode: "prepaid" },
        status: "active",
        createdBy: objectIdFrom(actor),
      });
    } catch (error: any) {
      if (error?.code === 11000)
        return this.models.AdAccount.findOne({
          "owner.organizationId": objectIdFrom(organizationId),
        }).orFail();
      throw error;
    }
  }

  async placements(managed = false) {
    return this.models.AdPlacement.find(managed ? {} : { status: "active" })
      .sort({ code: 1 })
      .lean();
  }

  async upsertPlacement(actor: string, input: any, requestId: string) {
    const storage = toStorage(input) as any;
    const before = await this.models.AdPlacement.findOne({ code: input.code }).lean();
    const item = await this.models.AdPlacement.findOneAndUpdate(
      { code: input.code },
      {
        $set: { ...storage, updatedBy: objectIdFrom(actor) },
        $setOnInsert: { createdBy: objectIdFrom(actor) },
      },
      { returnDocument: "after", upsert: true },
    ).lean();
    await this.audit.record({
      actorUserId: actor,
      action: before ? "advertising.placement.updated" : "advertising.placement.created",
      entityType: "ad_placement",
      entityId: String(item!._id),
      ...(before ? { before } : {}),
      after: item,
      requestId,
    });
    return item;
  }

  async campaigns(actor: string, organizationId: string, query: any) {
    await this.organization(actor, organizationId);
    const filter = {
      organizationId: objectIdFrom(organizationId),
      ...(query.status ? { status: query.status } : {}),
    };
    const [items, total] = await Promise.all([
      this.models.AdCampaign.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      this.models.AdCampaign.countDocuments(filter),
    ]);
    return { items, total };
  }

  private async validateReferences(organizationId: string, input: any) {
    if (input.placement_ids) {
      const count = await this.models.AdPlacement.countDocuments({
        _id: { $in: input.placement_ids.map(objectIdFrom) },
        status: "active",
      });
      if (count !== new Set(input.placement_ids).size)
        throw new ApiError("AD_PLACEMENT_INVALID", "یک یا چند جایگاه تبلیغ معتبر نیست.", 422);
    }
    if (input.targeting?.branch_ids?.length) {
      const branches = (await this.models.Branch.find({
        _id: { $in: input.targeting.branch_ids.map(objectIdFrom) },
        status: { $ne: "archived" },
      }).lean()) as any[];
      const clubs = await this.models.Club.countDocuments({
        _id: { $in: branches.map((item) => item.clubId) },
        organizationId: objectIdFrom(organizationId),
      });
      if (
        branches.length !== input.targeting.branch_ids.length ||
        clubs !== new Set(branches.map((item) => String(item.clubId))).size
      )
        throw new ApiError(
          "AD_TARGET_BRANCH_INVALID",
          "یک یا چند شعبه هدف متعلق به سازمان نیست.",
          422,
        );
    }
  }

  async createCampaign(actor: string, organizationId: string, input: any, requestId: string) {
    await this.organization(actor, organizationId);
    await this.validateReferences(organizationId, input);
    const account = await this.account(organizationId, actor);
    const item = await this.models.AdCampaign.create({
      accountId: account._id,
      organizationId: objectIdFrom(organizationId),
      ...(toStorage(input) as any),
      metrics: { impressions: 0, clicks: 0, conversions: 0, spendMinor: 0 },
      review: { history: [] },
      status: "draft",
      createdBy: objectIdFrom(actor),
    });
    await this.audit.record({
      actorUserId: actor,
      action: "advertising.campaign.created",
      entityType: "ad_campaign",
      entityId: String(item._id),
      organizationId,
      after: item.toObject(),
      requestId,
    });
    return item.toObject();
  }

  async updateCampaign(
    actor: string,
    organizationId: string,
    id: string,
    input: any,
    requestId: string,
  ) {
    await this.organization(actor, organizationId);
    await this.validateReferences(organizationId, input);
    const before = (await this.models.AdCampaign.findOne({
      _id: objectIdFrom(id),
      organizationId: objectIdFrom(organizationId),
    }).lean()) as any;
    if (!before) throw new ApiError("AD_CAMPAIGN_NOT_FOUND", "کمپین پیدا نشد.", 404);
    if (!["draft", "rejected"].includes(before.status))
      throw new ApiError("AD_CAMPAIGN_LOCKED", "فقط کمپین پیش‌نویس یا ردشده قابل ویرایش است.", 409);
    const item = await this.models.AdCampaign.findByIdAndUpdate(
      id,
      { $set: { ...flattenPatch(toStorage(input) as any), updatedBy: objectIdFrom(actor) } },
      { returnDocument: "after" },
    ).lean();
    await this.audit.record({
      actorUserId: actor,
      action: "advertising.campaign.updated",
      entityType: "ad_campaign",
      entityId: id,
      organizationId,
      before,
      after: item,
      requestId,
    });
    return item;
  }

  async action(
    actor: string,
    organizationId: string,
    id: string,
    action: string,
    requestId: string,
  ) {
    await this.organization(actor, organizationId);
    const item = (await this.models.AdCampaign.findOne({
      _id: objectIdFrom(id),
      organizationId: objectIdFrom(organizationId),
    })) as any;
    if (!item) throw new ApiError("AD_CAMPAIGN_NOT_FOUND", "کمپین پیدا نشد.", 404);
    const transitions: Record<string, Record<string, string>> = {
      submit: { draft: "pending_review", rejected: "pending_review" },
      pause: { active: "paused" },
      resume: { paused: "active" },
      archive: { draft: "archived", rejected: "archived", paused: "archived", active: "archived" },
    };
    const next = transitions[action]?.[item.status];
    if (!next)
      throw new ApiError("AD_TRANSITION_INVALID", "این تغییر وضعیت برای کمپین مجاز نیست.", 409);
    const before = item.toObject();
    item.status = next;
    item.lifecycle = { ...(item.lifecycle ?? {}), lastAction: action, lastActionAt: new Date() };
    item.updatedBy = objectIdFrom(actor);
    await item.save();
    await this.audit.record({
      actorUserId: actor,
      action: `advertising.campaign.${action}`,
      entityType: "ad_campaign",
      entityId: id,
      organizationId,
      before,
      after: item.toObject(),
      requestId,
    });
    return item.toObject();
  }

  async adminCampaigns(query: any) {
    const filter = query.status ? { status: query.status } : {};
    const [items, total] = await Promise.all([
      this.models.AdCampaign.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      this.models.AdCampaign.countDocuments(filter),
    ]);
    return { items, total };
  }

  async review(actor: string, id: string, input: any, requestId: string) {
    const item = (await this.models.AdCampaign.findById(id)) as any;
    if (!item) throw new ApiError("AD_CAMPAIGN_NOT_FOUND", "کمپین پیدا نشد.", 404);
    if (item.status !== "pending_review")
      throw new ApiError("AD_REVIEW_INVALID", "این کمپین در انتظار بررسی نیست.", 409);
    const before = item.toObject();
    item.status = input.decision === "approve" ? "active" : "rejected";
    item.review = {
      ...(item.review ?? {}),
      decision: input.decision,
      note: input.note,
      reviewedAt: new Date(),
      reviewedBy: objectIdFrom(actor),
      history: [
        ...(item.review?.history ?? []),
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
      action: `advertising.campaign.${input.decision}d`,
      entityType: "ad_campaign",
      entityId: id,
      organizationId: String(item.organizationId),
      before,
      after: item.toObject(),
      requestId,
    });
    return item.toObject();
  }

  private matches(targeting: any, query: any) {
    const includes = (values: unknown[] | undefined, value?: string) =>
      !values?.length || !value || values.some((item) => String(item) === value);
    return (
      includes(targeting?.cities, query.city) &&
      includes(targeting?.sportIds, query.sport_id) &&
      includes(targeting?.branchIds, query.branch_id) &&
      includes(targeting?.audienceRoles, query.audience_role)
    );
  }

  private signTracking(payload: Record<string, unknown>) {
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = createHmac("sha256", this.trackingSecret).update(body).digest("base64url");
    return `${body}.${signature}`;
  }

  private verifyTracking(token: string) {
    const [body, signature, extra] = token.split(".");
    if (!body || !signature || extra)
      throw new ApiError("AD_TRACKING_INVALID", "توکن رهگیری تبلیغ معتبر نیست.", 422);
    const expected = createHmac("sha256", this.trackingSecret).update(body).digest();
    const received = Buffer.from(signature, "base64url");
    if (received.length !== expected.length || !timingSafeEqual(received, expected))
      throw new ApiError("AD_TRACKING_INVALID", "توکن رهگیری تبلیغ معتبر نیست.", 422);
    try {
      const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as any;
      if (!payload.expiresAt || Date.now() > payload.expiresAt)
        throw new ApiError("AD_TRACKING_EXPIRED", "توکن رهگیری تبلیغ منقضی شده است.", 410);
      return payload;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("AD_TRACKING_INVALID", "توکن رهگیری تبلیغ معتبر نیست.", 422);
    }
  }

  async serve(code: string, query: any) {
    const placement = (await this.models.AdPlacement.findOne({
      code,
      status: "active",
    }).lean()) as any;
    if (!placement) throw new ApiError("AD_PLACEMENT_NOT_FOUND", "جایگاه تبلیغ پیدا نشد.", 404);
    const now = new Date();
    const candidates = (await this.models.AdCampaign.find({
      placementIds: placement._id,
      status: "active",
      "schedule.startsAt": { $lte: now },
      "schedule.endsAt": { $gt: now },
    })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean()) as any[];
    const campaign = candidates.find(
      (item) =>
        this.matches(item.targeting, query) &&
        Number(item.metrics?.spendMinor ?? 0) < Number(item.budget?.totalMinor ?? 0),
    );
    if (!campaign) return null;
    const creative = campaign.creatives?.[Math.floor(Math.random() * campaign.creatives.length)];
    const renderId = crypto.randomUUID();
    return {
      campaign_id: String(campaign._id),
      placement: { code: placement.code, profile: placement.profile },
      creative,
      tracking: {
        token: this.signTracking({
          campaignId: String(campaign._id),
          placementCode: code,
          renderId,
          expiresAt: Date.now() + 30 * 60_000,
        }),
        placement_code: code,
      },
    };
  }

  async metric(campaignId: string, input: any) {
    const tracking = this.verifyTracking(input.tracking_token);
    if (tracking.campaignId !== campaignId)
      throw new ApiError("AD_TRACKING_MISMATCH", "توکن رهگیری متعلق به این کمپین نیست.", 422);
    const campaign = (await this.models.AdCampaign.findOne({
      _id: objectIdFrom(campaignId),
      status: "active",
    }).lean()) as any;
    if (!campaign) throw new ApiError("AD_CAMPAIGN_INACTIVE", "کمپین فعال نیست.", 409);
    const placement = (await this.models.AdPlacement.findOne({
      code: tracking.placementCode,
      _id: { $in: campaign.placementIds },
    }).lean()) as any;
    if (!placement)
      throw new ApiError("AD_PLACEMENT_MISMATCH", "جایگاه با کمپین همخوانی ندارد.", 422);
    const pricing = placement.pricing ?? {};
    const billable =
      pricing.model === "flat"
        ? input.type === "impression"
        : pricing.model === "cpm"
          ? input.type === "impression"
          : pricing.model === "cpc"
            ? input.type === "click"
            : input.type === "conversion";
    const costMinor = billable
      ? pricing.model === "cpm"
        ? Number(pricing.amountMinor ?? 0) / 1000
        : Number(pricing.amountMinor ?? 0)
      : 0;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const [daily] = await this.models.AdMetricEvent.aggregate([
      { $match: { campaignId: campaign._id, occurredAt: { $gte: startOfDay } } },
      { $group: { _id: null, spendMinor: { $sum: "$costMinor" } } },
    ]);
    if (
      Number(campaign.metrics?.spendMinor ?? 0) + costMinor >
      Number(campaign.budget?.totalMinor ?? 0)
    )
      throw new ApiError("AD_BUDGET_EXHAUSTED", "بودجه کمپین تمام شده است.", 409);
    if (Number(daily?.spendMinor ?? 0) + costMinor > Number(campaign.budget?.dailyMinor ?? 0))
      throw new ApiError("AD_DAILY_BUDGET_EXHAUSTED", "بودجه روزانه کمپین تمام شده است.", 409);
    const eventId = `${tracking.renderId}:${input.type}`;
    try {
      await this.models.AdMetricEvent.create({
        campaignId: campaign._id,
        eventId,
        type: input.type,
        context: {
          ...(toStorage(input.context) as Record<string, unknown>),
          placementCode: tracking.placementCode,
        },
        costMinor,
        occurredAt: new Date(),
      });
    } catch (error: any) {
      if (error?.code === 11000) return { accepted: true, duplicate: true };
      throw error;
    }
    const metric =
      input.type === "impression"
        ? "metrics.impressions"
        : input.type === "click"
          ? "metrics.clicks"
          : "metrics.conversions";
    await this.models.AdCampaign.updateOne(
      { _id: campaign._id },
      { $inc: { [metric]: 1, "metrics.spendMinor": costMinor } },
    );
    return { accepted: true, duplicate: false };
  }
}
