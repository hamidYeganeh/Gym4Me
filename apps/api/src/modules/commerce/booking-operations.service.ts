import { Inject, Injectable } from "@nestjs/common";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { PERMISSIONS } from "../../security/rbac.js";
import type { ClientSession } from "mongoose";
import { ApiError } from "../../common/api-error.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { AuditService } from "../audit/audit.service.js";
import { OrganizationAccessService } from "../organization/organization-access.service.js";
import { AvailabilityService } from "../supply/availability.service.js";
import { CancellationPolicyService } from "./cancellation-policy.service.js";
import { withTransaction } from "./commerce.transaction.js";
import { IdempotencyService } from "./idempotency.service.js";
import { LedgerService } from "./ledger.service.js";
import { MembershipCoverageService } from "./membership-coverage.service.js";
import { TaxCalculationService } from "./tax-calculation.service.js";

type StaffCancellation = {
  reason: string;
  policy_mode: "apply" | "waive" | "custom";
  custom_penalty?:
    { type: "percentage"; value: number } | { type: "fixed"; amount_minor: string } | undefined;
};

@Injectable()
export class BookingOperationsService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly access: OrganizationAccessService,
    private readonly availability: AvailabilityService,
    private readonly policies: CancellationPolicyService,
    private readonly ledger: LedgerService,
    private readonly idempotency: IdempotencyService,
    private readonly audit: AuditService,
    private readonly membershipCoverage: MembershipCoverageService,
    private readonly taxes: TaxCalculationService,
  ) {}

  private async lock(resourceIds: string[], session: ClientSession) {
    for (const id of [...new Set(resourceIds)].sort()) {
      const row = await this.models.Resource.updateOne(
        { _id: objectIdFrom(id), status: "active" },
        { $inc: { bookingRevision: 1 } },
        { session },
      );
      if (!row.matchedCount)
        throw new ApiError("RESOURCE_UNAVAILABLE", "یکی از منابع در دسترس نیست.", 409);
    }
  }
  private allocated(items: any[], resourceId: string, startAt: Date, endAt: Date) {
    return items
      .flatMap((item) => item.allocations ?? [])
      .filter(
        (allocation: any) =>
          String(allocation.resourceId) === resourceId &&
          new Date(allocation.startAt) < endAt &&
          new Date(allocation.endAt) > startAt,
      );
  }
  private async assertCapacity(
    allocations: any[],
    session: ClientSession,
    excludeBookingId?: string,
  ) {
    await this.lock(
      allocations.map((item) => String(item.resourceId)),
      session,
    );
    const now = new Date();
    for (const allocation of allocations) {
      const resourceId = String(allocation.resourceId);
      const startAt = new Date(allocation.startAt);
      const endAt = new Date(allocation.endAt);
      const resource = (await this.models.Resource.findById(resourceId)
        .session(session)
        .lean()) as any;
      const [holds, bookings] = await Promise.all([
        this.models.BookingHold.find({
          status: "held",
          expiresAt: { $gt: now },
          allocations: {
            $elemMatch: {
              resourceId: objectIdFrom(resourceId),
              startAt: { $lt: endAt },
              endAt: { $gt: startAt },
            },
          },
        })
          .session(session)
          .lean() as any,
        this.models.Booking.find({
          ...(excludeBookingId ? { _id: { $ne: objectIdFrom(excludeBookingId) } } : {}),
          status: { $in: ["pending_payment", "confirmed", "checked_in"] },
          allocations: {
            $elemMatch: {
              resourceId: objectIdFrom(resourceId),
              startAt: { $lt: endAt },
              endAt: { $gt: startAt },
            },
          },
        })
          .session(session)
          .lean() as any,
      ]);
      const existing = [
        ...this.allocated(holds as any[], resourceId, startAt, endAt),
        ...this.allocated(bookings as any[], resourceId, startAt, endAt),
      ];
      const requested = Number(allocation.quantity ?? 1);
      const used = existing.reduce((sum, item) => sum + Number(item.quantity ?? 1), 0);
      const available =
        resource.capacity?.mode === "exclusive"
          ? existing.length
            ? 0
            : Number(resource.capacity?.total ?? 1)
          : Math.max(0, Number(resource.capacity?.total ?? 1) - used);
      if (available < requested)
        throw new ApiError("CAPACITY_CHANGED", "ظرفیت انتخاب‌شده دیگر کافی نیست.", 409, {
          resource_id: resourceId,
          available,
          requested,
        });
    }
  }

  private async price(offering: any, branchId: string, participantCount: number) {
    const unit = BigInt(String(offering.pricing?.baseAmount ?? 0));
    const units = offering.pricing?.pricingMode === "per_person" ? BigInt(participantCount) : 1n;
    const total = unit * units;
    const tax = await this.taxes.calculate({
      organizationId: String(offering.organizationId),
      branchId,
      offeringId: String(offering._id),
      grossMinor: total.toString(),
      currency: offering.pricing?.currency ?? "IRR",
      offeringTaxIncluded: Boolean(offering.pricing?.taxIncluded),
    });
    return {
      currency: offering.pricing?.currency ?? "IRR",
      unitAmountMinor: unit.toString(),
      subtotalMinor: tax.subtotalMinor,
      discountMinor: "0",
      taxMinor: tax.taxMinor,
      totalMinor: tax.totalMinor,
      taxIncluded: tax.taxIncluded,
      taxRule: tax.taxRule,
      pricingMode: offering.pricing?.pricingMode ?? "per_booking",
    };
  }

  async create(actorUserId: string, branchId: string, input: any, key: string, requestId?: string) {
    const context = await this.access.assertBranch(
      actorUserId,
      branchId,
      PERMISSIONS.BRANCH_BOOKING_CREATE,
    );
    const offering = (await this.models.Offering.findOne({
      _id: objectIdFrom(input.offering_id),
      branchIds: objectIdFrom(branchId),
      status: "active",
    }).lean()) as any;
    if (!offering) throw new ApiError("OFFERING_NOT_AVAILABLE", "خدمت فعال پیدا نشد.", 404);
    const duration = Number(offering.bookingSettings?.durationMinutes ?? 60);
    const endsAt = new Date(input.starts_at.getTime() + duration * 60_000);
    const quantity = input.participants.length;
    if (
      quantity < Number(offering.capacity?.minimum ?? 1) ||
      quantity > Number(offering.capacity?.maximum ?? quantity)
    )
      throw new ApiError("INVALID_PARTICIPANT_COUNT", "تعداد شرکت‌کنندگان مجاز نیست.", 422);
    const requirements = (offering.resourceRequirements ?? []).filter(
      (item: any) => item.mode !== "optional",
    );
    const allocations = requirements.map((item: any) => ({
      resourceId: item.resourceId,
      startAt: input.starts_at,
      endAt: endsAt,
      quantity,
    }));
    for (const allocation of allocations) {
      const slots = await this.availability.slots(
        String(allocation.resourceId),
        { from: input.starts_at, to: endsAt, duration_minutes: duration, participants: quantity },
        actorUserId,
      );
      if (
        !slots.slots.some(
          (slot) => slot.startAt === input.starts_at.toISOString() && slot.status === "available",
        )
      )
        throw new ApiError("SLOT_NOT_AVAILABLE", "سانس انتخاب‌شده در دسترس نیست.", 409);
    }
    const booking = await this.idempotency.execute(
      actorUserId,
      "branch.booking.create",
      key,
      { branchId, input },
      () =>
        withTransaction(
          () => this.models.Booking.db.startSession(),
          async (session) => {
            await this.assertCapacity(allocations, session);
            const [created] = await this.models.Booking.create(
              [
                {
                  customerUserId: objectIdFrom(input.customer_user_id),
                  organizationId: objectIdFrom(context.organizationId),
                  branchId: objectIdFrom(branchId),
                  offeringId: offering._id,
                  occurrenceIndex: 0,
                  allocations,
                  participants: input.participants,
                  pricing: await this.price(offering, branchId, quantity),
                  payment: {
                    method: input.payment_mode,
                    status: input.payment_mode === "complimentary" ? "waived" : "unpaid",
                  },
                  operations: { source: "reception", note: input.note },
                  status: "confirmed",
                  createdBy: objectIdFrom(actorUserId),
                },
              ],
              { session },
            );
            await this.models.OutboxEvent.create(
              [
                {
                  type: "booking.created",
                  aggregate: { type: "booking", id: created!._id },
                  payload: {
                    bookingIds: [created!._id],
                    customerUserId: input.customer_user_id,
                    source: "reception",
                  },
                  status: "pending",
                },
              ],
              { session },
            );
            return created!.toObject();
          },
        ),
    );
    await this.audit.record({
      actorUserId,
      action: "branch.booking.created",
      entityType: "booking",
      entityId: String((booking as any)._id),
      organizationId: context.organizationId,
      after: booking,
      requestId,
    });
    return booking;
  }

  async reschedule(
    actorUserId: string,
    branchId: string,
    bookingId: string,
    startsAt: Date,
    reason: string,
    key: string,
    requestId?: string,
  ) {
    const context = await this.access.assertBranch(
      actorUserId,
      branchId,
      PERMISSIONS.BRANCH_BOOKING_RESCHEDULE,
    );
    const before = (await this.models.Booking.findOne({
      _id: objectIdFrom(bookingId),
      branchId: objectIdFrom(branchId),
    }).lean()) as any;
    if (!before) throw new ApiError("BOOKING_NOT_FOUND", "رزرو پیدا نشد.", 404);
    if (!["pending_payment", "confirmed"].includes(before.status))
      throw new ApiError("BOOKING_NOT_RESCHEDULABLE", "رزرو در وضعیت قابل جابه‌جایی نیست.", 409);
    const firstStart = Math.min(
      ...before.allocations.map((item: any) => new Date(item.startAt).getTime()),
    );
    const delta = startsAt.getTime() - firstStart;
    const allocations = before.allocations.map((item: any) => ({
      ...item,
      startAt: new Date(new Date(item.startAt).getTime() + delta),
      endAt: new Date(new Date(item.endAt).getTime() + delta),
    }));
    for (const allocation of allocations) {
      const duration = Math.round(
        (new Date(allocation.endAt).getTime() - new Date(allocation.startAt).getTime()) / 60_000,
      );
      const slots = await this.availability.slots(
        String(allocation.resourceId),
        {
          from: new Date(allocation.startAt),
          to: new Date(allocation.endAt),
          duration_minutes: duration,
          participants: Number(allocation.quantity ?? 1),
          exclude_booking_id: bookingId,
        },
        actorUserId,
      );
      if (
        !slots.slots.some(
          (slot) =>
            slot.startAt === new Date(allocation.startAt).toISOString() &&
            slot.status === "available",
        )
      )
        throw new ApiError(
          "SLOT_NOT_AVAILABLE",
          "زمان جدید خارج از تقویم کاری یا ظرفیت مجاز است.",
          409,
        );
    }
    const result = await this.idempotency.execute(
      actorUserId,
      "branch.booking.reschedule",
      key,
      { bookingId, startsAt, reason },
      () =>
        withTransaction(
          () => this.models.Booking.db.startSession(),
          async (session) => {
            await this.assertCapacity(allocations, session, bookingId);
            const booking = await this.models.Booking.findOneAndUpdate(
              {
                _id: objectIdFrom(bookingId),
                branchId: objectIdFrom(branchId),
                status: before.status,
              },
              {
                $set: {
                  allocations,
                  reschedule: {
                    previousAllocations: before.allocations,
                    reason,
                    rescheduledAt: new Date(),
                    rescheduledBy: objectIdFrom(actorUserId),
                  },
                  updatedBy: objectIdFrom(actorUserId),
                },
                $inc: { version: 1 },
              },
              { returnDocument: "after", session },
            ).lean();
            if (!booking)
              throw new ApiError("BOOKING_CHANGED", "رزرو هم‌زمان تغییر کرده است.", 409);
            await this.models.AccessPass.updateMany(
              { bookingId: objectIdFrom(bookingId), status: "issued" },
              {
                $set: {
                  status: "revoked",
                  revokedAt: new Date(),
                  updatedBy: objectIdFrom(actorUserId),
                },
              },
              { session },
            );
            await this.models.OutboxEvent.create(
              [
                {
                  type: "booking.rescheduled",
                  aggregate: { type: "booking", id: objectIdFrom(bookingId) },
                  payload: { customerUserId: before.customerUserId, startsAt, reason },
                  status: "pending",
                },
              ],
              { session },
            );
            return booking;
          },
        ),
    );
    await this.audit.record({
      actorUserId,
      action: "branch.booking.rescheduled",
      entityType: "booking",
      entityId: bookingId,
      organizationId: context.organizationId,
      before,
      after: result,
      requestId,
    });
    return result;
  }

  private overrideCalculation(calculation: any, input: StaffCancellation) {
    if (input.policy_mode === "apply") return calculation;
    const total = BigInt(calculation.totalMinor);
    let penalty = 0n;
    if (input.policy_mode === "custom" && input.custom_penalty?.type === "percentage")
      penalty = (total * BigInt(Math.round(input.custom_penalty.value * 100))) / 10_000n;
    if (input.policy_mode === "custom" && input.custom_penalty?.type === "fixed")
      penalty = BigInt(input.custom_penalty.amount_minor);
    penalty = penalty > total ? total : penalty;
    return {
      ...calculation,
      penaltyMinor: penalty.toString(),
      refundableMinor: (total - penalty).toString(),
      override: { mode: input.policy_mode, customPenalty: input.custom_penalty },
    };
  }

  async cancel(
    actorUserId: string,
    branchId: string,
    bookingId: string,
    input: StaffCancellation,
    key: string,
    requestId?: string,
  ) {
    const context = await this.access.assertBranch(
      actorUserId,
      branchId,
      PERMISSIONS.BRANCH_BOOKING_CANCEL,
    );
    if (input.policy_mode !== "apply")
      await this.access.assertBranch(
        actorUserId,
        branchId,
        PERMISSIONS.BRANCH_BOOKING_OVERRIDE_CANCELLATION,
      );
    const before = (await this.models.Booking.findOne({
      _id: objectIdFrom(bookingId),
      branchId: objectIdFrom(branchId),
    }).lean()) as any;
    if (!before) throw new ApiError("BOOKING_NOT_FOUND", "رزرو پیدا نشد.", 404);
    const result = await this.idempotency.execute(
      actorUserId,
      "branch.booking.cancel",
      key,
      { bookingId, input },
      () =>
        withTransaction(
          () => this.models.Booking.db.startSession(),
          async (session) => {
            const booking = (await this.models.Booking.findOne({
              _id: objectIdFrom(bookingId),
              branchId: objectIdFrom(branchId),
            }).session(session)) as any;
            if (!booking) throw new ApiError("BOOKING_NOT_FOUND", "رزرو پیدا نشد.", 404);
            if (booking.status === "cancelled") return booking.toObject();
            if (!["pending_payment", "confirmed"].includes(booking.status))
              throw new ApiError("BOOKING_NOT_CANCELLABLE", "رزرو در وضعیت قابل لغو نیست.", 409);
            await this.lock(
              (booking.allocations ?? []).map((item: any) => String(item.resourceId)),
              session,
            );
            let calculation = this.overrideCalculation(
              await this.policies.calculate(booking, new Date(), session),
              input,
            );
            if (booking.payment?.method === "membership") {
              await this.membershipCoverage.releaseBooking(bookingId, actorUserId, session);
              calculation = {
                ...calculation,
                penaltyMinor: "0",
                refundableMinor: "0",
                paymentStatus: "membership_released",
              };
              booking.payment.status = "released";
            } else if (booking.payment?.status === "paid") {
              const payment = (await this.models.Payment.findById(booking.payment.id).session(
                session,
              )) as any;
              if (!payment) throw new ApiError("PAYMENT_NOT_FOUND", "پرداخت رزرو پیدا نشد.", 409);
              const [refund] = await this.models.Refund.create(
                [
                  {
                    paymentId: payment._id,
                    amount: {
                      amountMinor: calculation.refundableMinor,
                      currency: calculation.currency,
                    },
                    calculation,
                    reason: { code: "staff_cancelled", description: input.reason },
                    provider: { code: "internal_wallet" },
                    status: "processing",
                    createdBy: objectIdFrom(actorUserId),
                  },
                ],
                { session },
              );
              const transaction = await this.ledger.refundBooking(
                String(booking.customerUserId),
                String(booking.organizationId),
                String(refund!._id),
                calculation.totalMinor,
                calculation.refundableMinor,
                calculation.penaltyMinor,
                calculation.currency,
                key,
                session,
              );
              refund!.status = "paid";
              refund!.ledgerTransactionId = transaction._id;
              refund!.refundedAt = new Date();
              await refund!.save({ session });
              const paymentStatus =
                calculation.refundableMinor === calculation.totalMinor
                  ? "refunded"
                  : calculation.refundableMinor === "0"
                    ? "retained"
                    : "partially_refunded";
              booking.payment.status = paymentStatus;
              payment.status = paymentStatus;
              payment.updatedBy = objectIdFrom(actorUserId);
              await payment.save({ session });
            } else
              calculation = {
                ...calculation,
                penaltyMinor: "0",
                refundableMinor: "0",
                paymentStatus: booking.payment?.status ?? "unpaid",
              };
            booking.status = "cancelled";
            booking.cancellation = {
              reason: input.reason,
              calculation,
              policyMode: input.policy_mode,
              cancelledAt: new Date(),
              cancelledBy: objectIdFrom(actorUserId),
              source: "staff",
            };
            await booking.save({ session });
            await this.models.AccessPass.updateMany(
              { bookingId: booking._id, status: "issued" },
              {
                $set: {
                  status: "revoked",
                  revokedAt: new Date(),
                  updatedBy: objectIdFrom(actorUserId),
                },
              },
              { session },
            );
            await this.models.OutboxEvent.create(
              [
                {
                  type: "booking.cancelled",
                  aggregate: { type: "booking", id: booking._id },
                  payload: { customerUserId: booking.customerUserId, calculation, source: "staff" },
                  status: "pending",
                },
              ],
              { session },
            );
            return booking.toObject();
          },
        ),
    );
    await this.audit.record({
      actorUserId,
      action:
        input.policy_mode === "apply"
          ? "branch.booking.cancelled"
          : "branch.booking.cancellation_overridden",
      entityType: "booking",
      entityId: bookingId,
      organizationId: context.organizationId,
      before,
      after: result,
      requestId,
    });
    return result;
  }
}
