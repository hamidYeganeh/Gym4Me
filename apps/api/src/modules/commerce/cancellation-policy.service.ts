import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import type { ClientSession } from "mongoose";
import { PERMISSIONS } from "../../security/rbac.js";
import { ApiError } from "../../common/api-error.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { AuditService } from "../audit/audit.service.js";
import { OrganizationAccessService } from "../organization/organization-access.service.js";
import { withTransaction } from "./commerce.transaction.js";

type ScopeType = "organization" | "club";
type PenaltyInput =
  | { type: "percentage"; value: number }
  | { type: "fixed"; amount_minor: string }
  | { type: "none" };

@Injectable()
export class CancellationPolicyService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly access: OrganizationAccessService,
    private readonly audit: AuditService,
  ) {}

  private penalty(input: PenaltyInput) {
    return input.type === "percentage"
      ? { type: "percentage", percentageBps: Math.round(input.value * 100) }
      : input.type === "fixed"
        ? { type: "fixed", amountMinor: input.amount_minor }
        : { type: "none" };
  }
  private document(scope: { type: ScopeType; id: string }, input: any, userId: string) {
    return {
      scope: { type: scope.type, id: objectIdFrom(scope.id) },
      profile: input.profile,
      rules: input.rules.map((rule: any) => ({
        id: randomUUID(),
        minimumMinutesBeforeStart: Math.round(rule.minimum_hours_before * 60),
        penalty: this.penalty(rule.penalty),
        status: rule.status,
      })),
      fallbackPenalty: this.penalty(input.fallback_penalty),
      settings: {
        refundDestination: input.settings.refund_destination,
        applyToPendingPayment: input.settings.apply_to_pending_payment,
      },
      customData: input.custom_data ?? {},
      status: input.status,
      createdBy: objectIdFrom(userId),
      updatedBy: objectIdFrom(userId),
    };
  }
  private async scope(scopeType: ScopeType, scopeId: string, userId: string) {
    if (scopeType === "organization") {
      await this.access.assertOrganization(
        userId,
        scopeId,
        PERMISSIONS.ORGANIZATION_CANCELLATION_POLICY_MANAGE,
      );
      const organization = await this.models.Organization.findById(scopeId).lean();
      if (!organization) throw new ApiError("ORGANIZATION_NOT_FOUND", "سازمان پیدا نشد.", 404);
      return { type: scopeType, id: scopeId, organizationId: scopeId };
    }
    const club = (await this.models.Club.findById(scopeId).lean()) as any;
    if (!club) throw new ApiError("CLUB_NOT_FOUND", "باشگاه پیدا نشد.", 404);
    const organizationId = String(club.organizationId);
    await this.access.assertOrganization(
      userId,
      organizationId,
      PERMISSIONS.ORGANIZATION_CANCELLATION_POLICY_MANAGE,
    );
    return { type: scopeType, id: scopeId, organizationId };
  }

  async list(scopeType: ScopeType, scopeId: string, userId: string) {
    await this.scope(scopeType, scopeId, userId);
    return this.models.CancellationPolicy.find({
      "scope.type": scopeType,
      "scope.id": objectIdFrom(scopeId),
      status: { $ne: "archived" },
    })
      .sort({ updatedAt: -1 })
      .lean();
  }
  async create(
    scopeType: ScopeType,
    scopeId: string,
    input: any,
    userId: string,
    requestId?: string,
  ) {
    const context = await this.scope(scopeType, scopeId, userId);
    const created = await withTransaction(
      () => this.models.CancellationPolicy.db.startSession(),
      async (session) => {
        if (input.status === "active")
          await this.models.CancellationPolicy.updateMany(
            { "scope.type": scopeType, "scope.id": objectIdFrom(scopeId), status: "active" },
            { $set: { status: "inactive", updatedBy: objectIdFrom(userId) } },
            { session },
          );
        const [item] = await this.models.CancellationPolicy.create(
          [this.document({ type: scopeType, id: scopeId }, input, userId)],
          { session },
        );
        if (!item) throw new ApiError("POLICY_WRITE_FAILED", "ثبت سیاست لغو انجام نشد.", 500);
        return item.toObject();
      },
    );
    await this.audit.record({
      actorUserId: userId,
      action: "cancellation_policy.created",
      entityType: "cancellation_policy",
      entityId: String((created as any)._id),
      organizationId: context.organizationId,
      after: created,
      requestId,
    });
    return created;
  }
  async update(policyId: string, input: any, userId: string, requestId?: string) {
    const before = (await this.models.CancellationPolicy.findById(policyId).lean()) as any;
    if (!before) throw new ApiError("CANCELLATION_POLICY_NOT_FOUND", "سیاست لغو پیدا نشد.", 404);
    const context = await this.scope(before.scope.type, String(before.scope.id), userId);
    const replacement = this.document(
      { type: before.scope.type, id: String(before.scope.id) },
      input,
      userId,
    );
    const after = await withTransaction(
      () => this.models.CancellationPolicy.db.startSession(),
      async (session) => {
        if (input.status === "active")
          await this.models.CancellationPolicy.updateMany(
            {
              _id: { $ne: objectIdFrom(policyId) },
              "scope.type": before.scope.type,
              "scope.id": before.scope.id,
              status: "active",
            },
            { $set: { status: "inactive", updatedBy: objectIdFrom(userId) } },
            { session },
          );
        return this.models.CancellationPolicy.findByIdAndUpdate(
          policyId,
          {
            $set: {
              profile: replacement.profile,
              rules: replacement.rules,
              fallbackPenalty: replacement.fallbackPenalty,
              settings: replacement.settings,
              customData: replacement.customData,
              status: input.status,
              updatedBy: objectIdFrom(userId),
            },
            $inc: { version: 1 },
          },
          { returnDocument: "after", runValidators: true, session },
        ).lean();
      },
    );
    await this.audit.record({
      actorUserId: userId,
      action: "cancellation_policy.updated",
      entityType: "cancellation_policy",
      entityId: policyId,
      organizationId: context.organizationId,
      before,
      after,
      requestId,
    });
    return after;
  }
  async archive(policyId: string, userId: string, requestId?: string) {
    const before = (await this.models.CancellationPolicy.findById(policyId).lean()) as any;
    if (!before) throw new ApiError("CANCELLATION_POLICY_NOT_FOUND", "سیاست لغو پیدا نشد.", 404);
    const context = await this.scope(before.scope.type, String(before.scope.id), userId);
    const after = await this.models.CancellationPolicy.findByIdAndUpdate(
      policyId,
      { $set: { status: "archived", updatedBy: objectIdFrom(userId) }, $inc: { version: 1 } },
      { returnDocument: "after" },
    ).lean();
    await this.audit.record({
      actorUserId: userId,
      action: "cancellation_policy.archived",
      entityType: "cancellation_policy",
      entityId: policyId,
      organizationId: context.organizationId,
      before,
      after,
      requestId,
    });
    return after;
  }

  private async resolve(booking: any, session?: ClientSession) {
    const branch = (await this.models.Branch.findById(booking.branchId)
      .session(session ?? null)
      .lean()) as any;
    if (!branch) return null;
    const club = (await this.models.Club.findById(branch.clubId)
      .session(session ?? null)
      .lean()) as any;
    if (!club) return null;
    return this.models.CancellationPolicy.findOne({
      status: "active",
      $or: [
        { "scope.type": "club", "scope.id": club._id },
        { "scope.type": "organization", "scope.id": club.organizationId },
      ],
    })
      .sort({ "scope.type": 1, updatedAt: -1 })
      .session(session ?? null)
      .lean() as any;
  }
  async calculate(booking: any, at = new Date(), session?: ClientSession) {
    const startsAt = new Date(
      Math.min(
        ...(booking.allocations ?? []).map((allocation: any) =>
          new Date(allocation.startAt).getTime(),
        ),
      ),
    );
    if (!Number.isFinite(startsAt.getTime()))
      throw new ApiError("BOOKING_START_NOT_FOUND", "زمان شروع رزرو مشخص نیست.", 409);
    const remainingMinutes = Math.max(0, Math.floor((startsAt.getTime() - at.getTime()) / 60_000));
    const totalMinor = BigInt(String(booking.pricing?.totalMinor ?? "0"));
    const policy = await this.resolve(booking, session);
    const rules = (policy?.rules ?? [])
      .filter((rule: any) => rule.status === "active")
      .sort((a: any, b: any) => b.minimumMinutesBeforeStart - a.minimumMinutesBeforeStart);
    const matched = rules.find(
      (rule: any) => remainingMinutes >= Number(rule.minimumMinutesBeforeStart),
    );
    const penaltyRule = matched?.penalty ?? policy?.fallbackPenalty ?? { type: "none" };
    let penaltyMinor = 0n;
    if (penaltyRule.type === "percentage")
      penaltyMinor =
        (totalMinor *
          BigInt(Math.max(0, Math.min(10_000, Number(penaltyRule.percentageBps ?? 0))))) /
        10_000n;
    if (penaltyRule.type === "fixed") penaltyMinor = BigInt(String(penaltyRule.amountMinor ?? "0"));
    penaltyMinor = penaltyMinor > totalMinor ? totalMinor : penaltyMinor;
    const refundableMinor = totalMinor - penaltyMinor;
    return {
      calculatedAt: at,
      startsAt,
      remainingMinutes,
      totalMinor: totalMinor.toString(),
      penaltyMinor: penaltyMinor.toString(),
      refundableMinor: refundableMinor.toString(),
      currency: booking.pricing?.currency ?? "IRR",
      policy: policy
        ? {
            id: policy._id,
            scope: policy.scope,
            profile: policy.profile,
            version: policy.version,
            matchedRuleId: matched?.id ?? null,
            penalty: penaltyRule,
          }
        : null,
    };
  }
  async preview(userId: string, bookingId: string) {
    const booking = (await this.models.Booking.findOne({
      _id: objectIdFrom(bookingId),
      customerUserId: objectIdFrom(userId),
    }).lean()) as any;
    if (!booking) throw new ApiError("BOOKING_NOT_FOUND", "رزرو پیدا نشد.", 404);
    if (!["pending_payment", "confirmed"].includes(booking.status))
      throw new ApiError("BOOKING_NOT_CANCELLABLE", "رزرو در وضعیت قابل لغو نیست.", 409);
    const result = await this.calculate(booking);
    if (booking.payment?.status !== "paid")
      return {
        ...result,
        penaltyMinor: "0",
        refundableMinor: "0",
        paymentStatus: booking.payment?.status ?? "unpaid",
      };
    return { ...result, paymentStatus: "paid" };
  }
}
