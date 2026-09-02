import { Inject, Injectable } from "@nestjs/common";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { PERMISSIONS } from "../../security/rbac.js";
import type { ClientSession } from "mongoose";
import { ApiError } from "../../common/api-error.js";
import { paginationOffset } from "../../common/query.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { AuditService } from "../audit/audit.service.js";
import { OrganizationAccessService } from "../organization/organization-access.service.js";
import { withTransaction } from "./commerce.transaction.js";
import { CancellationPolicyService } from "./cancellation-policy.service.js";
import { IdempotencyService } from "./idempotency.service.js";
import { InvoiceService } from "./invoice.service.js";
import { LedgerService } from "./ledger.service.js";
import { MembershipCoverageService } from "./membership-coverage.service.js";
import { AvailabilityService } from "../supply/availability.service.js";

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");
@Injectable()
export class BookingService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly idempotency: IdempotencyService,
    private readonly ledger: LedgerService,
    private readonly access: OrganizationAccessService,
    private readonly audit: AuditService,
    private readonly cancellationPolicies: CancellationPolicyService,
    private readonly membershipCoverage: MembershipCoverageService,
    private readonly invoices: InvoiceService,
    private readonly availability: AvailabilityService,
  ) {}
  private async lockResources(resourceIds: string[], session: ClientSession) {
    for (const id of [...new Set(resourceIds)].sort()) {
      const result = await this.models.Resource.updateOne(
        { _id: objectIdFrom(id), status: "active" },
        { $inc: { bookingRevision: 1 } },
        { session },
      );
      if (!result.matchedCount)
        throw new ApiError("RESOURCE_UNAVAILABLE", "یکی از منابع رزرو در دسترس نیست.", 409);
    }
  }
  private allocated(items: any[], resourceId: string, startAt: Date, endAt: Date) {
    return items
      .flatMap((item) => item.allocations ?? [])
      .filter(
        (item: any) =>
          String(item.resourceId) === resourceId &&
          new Date(item.startAt) < endAt &&
          new Date(item.endAt) > startAt,
      );
  }
  private async assertCapacity(
    allocations: any[],
    session: ClientSession,
    excludeBookingId?: string,
  ) {
    await this.lockResources(
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
            : (resource.capacity?.total ?? 1)
          : Math.max(0, Number(resource.capacity?.total ?? 1) - used);
      if (available < requested)
        throw new ApiError("CAPACITY_CHANGED", "ظرفیت انتخاب‌شده دیگر کافی نیست.", 409, {
          resource_id: resourceId,
          available,
          requested,
        });
    }
  }
  async createHold(userId: string, quoteId: string, key: string) {
    return this.idempotency.execute(userId, "booking.hold.create", key, { quoteId }, () =>
      withTransaction(
        () => this.models.BookingHold.db.startSession(),
        async (session) => {
          const quote = (await this.models.PricingQuote.findOne({
            _id: objectIdFrom(quoteId),
            customerUserId: objectIdFrom(userId),
          }).session(session)) as any;
          if (!quote) throw new ApiError("QUOTE_NOT_FOUND", "پیش‌فاکتور پیدا نشد.", 404);
          if (quote.status !== "active" || quote.expiresAt <= new Date())
            throw new ApiError("QUOTE_EXPIRED", "مهلت پیش‌فاکتور تمام شده است.", 409);
          const allocations = quote.occurrences.flatMap((item: any) => item.allocations ?? []);
          await this.assertCapacity(allocations, session);
          const rawToken = randomBytes(32).toString("base64url");
          const expiresAt = new Date(Math.min(quote.expiresAt.getTime(), Date.now() + 10 * 60_000));
          const [hold] = await this.models.BookingHold.create(
            [
              {
                tokenHash: tokenHash(rawToken),
                quoteId: quote._id,
                customerUserId: objectIdFrom(userId),
                organizationId: quote.organizationId,
                branchId: quote.branchId,
                offeringId: quote.offeringId,
                allocations,
                participants: quote.participants,
                pricing: quote.pricing,
                expiresAt,
                status: "held",
                createdBy: objectIdFrom(userId),
              },
            ],
            { session },
          );
          quote.status = "held";
          await quote.save({ session });
          return { hold: hold!.toObject(), holdToken: rawToken };
        },
      ),
    );
  }
  async checkout(
    userId: string,
    input: {
      hold_token: string;
      payment_method: "wallet" | "sandbox_gateway" | "membership";
      membership_contract_id?: string | undefined;
    },
    key: string,
  ) {
    return this.idempotency.execute(userId, "booking.checkout", key, input, () =>
      withTransaction(
        () => this.models.Booking.db.startSession(),
        async (session) => {
          const hold = (await this.models.BookingHold.findOne({
            tokenHash: tokenHash(input.hold_token),
            customerUserId: objectIdFrom(userId),
          })
            .select("+tokenHash")
            .session(session)) as any;
          if (!hold) throw new ApiError("HOLD_NOT_FOUND", "رزرو موقت پیدا نشد.", 404);
          if (hold.status !== "held" || hold.expiresAt <= new Date())
            throw new ApiError("HOLD_EXPIRED", "مهلت رزرو موقت تمام شده است.", 409);
          await this.lockResources(
            hold.allocations.map((item: any) => String(item.resourceId)),
            session,
          );
          const byOccurrence = new Map<number, any[]>();
          for (const allocation of hold.allocations) {
            const index = Number(allocation.occurrenceIndex ?? 0);
            byOccurrence.set(index, [...(byOccurrence.get(index) ?? []), allocation]);
          }
          const recurring = byOccurrence.size > 1;
          let series: any;
          if (recurring)
            [series] = await this.models.BookingSeries.create(
              [
                {
                  customerUserId: objectIdFrom(userId),
                  recurrence: { type: "weekly", occurrences: byOccurrence.size },
                  bookingIds: [],
                  pricing: hold.pricing,
                  status: input.payment_method === "sandbox_gateway" ? "pending_payment" : "active",
                  createdBy: objectIdFrom(userId),
                },
              ],
              { session },
            );
          const total = BigInt(hold.pricing.totalMinor);
          const base = total / BigInt(byOccurrence.size);
          const remainder = total % BigInt(byOccurrence.size);
          const bookings: any[] = [];
          for (const [index, allocations] of [...byOccurrence.entries()].sort(
            (a, b) => a[0] - b[0],
          )) {
            const occurrenceTotal = base + (index === 0 ? remainder : 0n);
            const [booking] = await this.models.Booking.create(
              [
                {
                  customerUserId: objectIdFrom(userId),
                  ...(series ? { seriesId: series._id } : {}),
                  organizationId: hold.organizationId,
                  branchId: hold.branchId,
                  offeringId: hold.offeringId,
                  holdId: hold._id,
                  occurrenceIndex: index,
                  allocations,
                  participants: hold.participants,
                  recurrence: recurring
                    ? { type: "weekly", index, total: byOccurrence.size }
                    : undefined,
                  pricing: { ...hold.pricing, totalMinor: occurrenceTotal.toString() },
                  status:
                    input.payment_method === "sandbox_gateway" ? "pending_payment" : "confirmed",
                  createdBy: objectIdFrom(userId),
                },
              ],
              { session },
            );
            bookings.push(booking);
          }
          const reference = series ?? bookings[0];
          let payment: any;
          let membership: any;
          if (input.payment_method === "wallet") {
            const transaction = await this.ledger.payBooking(
              userId,
              String(reference._id),
              hold.pricing.totalMinor,
              hold.pricing.currency,
              key,
              session,
            );
            [payment] = await this.models.Payment.create(
              [
                {
                  payerUserId: objectIdFrom(userId),
                  payable: { type: series ? "booking_series" : "booking", id: reference._id },
                  amount: { amountMinor: hold.pricing.totalMinor, currency: hold.pricing.currency },
                  method: "wallet",
                  provider: { code: "internal_wallet" },
                  ledgerTransactionId: transaction._id,
                  idempotencyKey: key,
                  paidAt: new Date(),
                  status: "paid",
                  createdBy: objectIdFrom(userId),
                },
              ],
              { session },
            );
          } else if (input.payment_method === "membership") {
            membership = await this.membershipCoverage.reserve(
              userId,
              input.membership_contract_id!,
              hold,
              bookings,
              session,
            );
          } else {
            [payment] = await this.models.Payment.create(
              [
                {
                  payerUserId: objectIdFrom(userId),
                  payable: { type: series ? "booking_series" : "booking", id: reference._id },
                  amount: { amountMinor: hold.pricing.totalMinor, currency: hold.pricing.currency },
                  method: "sandbox_gateway",
                  provider: { code: "sandbox", authority: randomUUID(), mode: "manual_confirm" },
                  attempts: [{ createdAt: new Date(), status: "created" }],
                  idempotencyKey: key,
                  expiresAt: new Date(Date.now() + 15 * 60_000),
                  status: "pending",
                  createdBy: objectIdFrom(userId),
                },
              ],
              { session },
            );
          }
          if (payment?.status === "paid")
            await this.invoices.issue(
              {
                sourceType: series ? "booking_series" : "booking",
                sourceId: String(reference._id),
                paymentId: String(payment._id),
                userId,
                organizationId: String(bookings[0]!.organizationId),
                title: series ? "رزرو دوره‌ای" : "رزرو ورزشی",
                amountMinor: hold.pricing.totalMinor,
                subtotalMinor: hold.pricing.subtotalMinor,
                taxMinor: hold.pricing.taxMinor,
                currency: hold.pricing.currency,
              },
              session,
            );
          await this.models.Booking.updateMany(
            { _id: { $in: bookings.map((item) => item._id) } },
            {
              $set: {
                payment:
                  input.payment_method === "membership"
                    ? {
                        id: membership.contract._id,
                        method: "membership",
                        status: "covered",
                        membershipContractId: membership.contract._id,
                        membershipUsageIds: membership.usages.map((item: any) => item._id),
                      }
                    : { id: payment._id, method: input.payment_method, status: payment.status },
              },
            },
            { session },
          );
          if (series) {
            series.bookingIds = bookings.map((item) => item._id);
            await series.save({ session });
          }
          hold.status = "converted";
          hold.convertedAt = new Date();
          await hold.save({ session });
          await this.models.PricingQuote.updateOne(
            { _id: hold.quoteId },
            { $set: { status: "converted" } },
            { session },
          );
          await this.models.OutboxEvent.create(
            [
              {
                type: "booking.created",
                aggregate: { type: series ? "booking_series" : "booking", id: reference._id },
                payload: { bookingIds: bookings.map((item) => item._id), customerUserId: userId },
                status: "pending",
              },
            ],
            { session },
          );
          return {
            series: series?.toObject(),
            bookings: bookings.map((item) => item.toObject()),
            ...(payment ? { payment: payment.toObject() } : {}),
            ...(membership
              ? {
                  membership: {
                    contractId: String(membership.contract._id),
                    product: membership.product.profile,
                    usageIds: membership.usages.map((item: any) => String(item._id)),
                    status: "reserved",
                  },
                }
              : {}),
            ...(input.payment_method === "sandbox_gateway"
              ? { nextAction: { type: "mock_gateway", paymentId: String(payment._id) } }
              : {}),
          };
        },
      ),
    );
  }
  async cancellationPreview(userId: string, bookingId: string) {
    return this.cancellationPolicies.preview(userId, bookingId);
  }
  async reschedule(
    userId: string,
    bookingId: string,
    startsAt: Date,
    reason: string,
    key: string,
  ) {
    const before = (await this.models.Booking.findOne({
      _id: objectIdFrom(bookingId),
      customerUserId: objectIdFrom(userId),
    }).lean()) as any;
    if (!before) throw new ApiError("BOOKING_NOT_FOUND", "رزرو پیدا نشد.", 404);
    if (!["pending_payment", "confirmed"].includes(before.status))
      throw new ApiError(
        "BOOKING_NOT_RESCHEDULABLE",
        "رزرو در وضعیت قابل جابه‌جایی نیست.",
        409,
      );
    if (startsAt <= new Date())
      throw new ApiError("RESCHEDULE_TIME_INVALID", "زمان جدید باید در آینده باشد.", 422);
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
      const slots = await this.availability.slots(String(allocation.resourceId), {
        from: new Date(allocation.startAt),
        to: new Date(allocation.endAt),
        duration_minutes: duration,
        participants: Number(allocation.quantity ?? 1),
        exclude_booking_id: bookingId,
      });
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
    return this.idempotency.execute(
      userId,
      "booking.reschedule",
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
                customerUserId: objectIdFrom(userId),
                status: before.status,
              },
              {
                $set: {
                  allocations,
                  reschedule: {
                    previousAllocations: before.allocations,
                    reason,
                    rescheduledAt: new Date(),
                    rescheduledBy: objectIdFrom(userId),
                  },
                  updatedBy: objectIdFrom(userId),
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
                  updatedBy: objectIdFrom(userId),
                },
              },
              { session },
            );
            await this.models.OutboxEvent.create(
              [
                {
                  type: "booking.rescheduled",
                  aggregate: { type: "booking", id: objectIdFrom(bookingId) },
                  payload: { customerUserId: userId, startsAt, reason },
                  status: "pending",
                },
              ],
              { session },
            );
            return booking;
          },
        ),
    );
  }
  async cancel(userId: string, bookingId: string, reason: string, key: string) {
    return this.idempotency.execute(userId, "booking.cancel", key, { bookingId, reason }, () =>
      withTransaction(
        () => this.models.Booking.db.startSession(),
        async (session) => {
          const booking = (await this.models.Booking.findOne({
            _id: objectIdFrom(bookingId),
            customerUserId: objectIdFrom(userId),
          }).session(session)) as any;
          if (!booking) throw new ApiError("BOOKING_NOT_FOUND", "رزرو پیدا نشد.", 404);
          if (booking.status === "cancelled") return booking.toObject();
          if (!["pending_payment", "confirmed"].includes(booking.status))
            throw new ApiError("BOOKING_NOT_CANCELLABLE", "رزرو در وضعیت قابل لغو نیست.", 409);
          await this.lockResources(
            (booking.allocations ?? []).map((item: any) => String(item.resourceId)),
            session,
          );
          let calculation: any = await this.cancellationPolicies.calculate(
            booking,
            new Date(),
            session,
          );
          if (booking.payment?.method === "membership") {
            await this.membershipCoverage.releaseBooking(bookingId, userId, session);
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
                  reason: { code: "customer_cancelled", description: reason },
                  provider: { code: "internal_wallet" },
                  status: "processing",
                  createdBy: objectIdFrom(userId),
                },
              ],
              { session },
            );
            if (!refund) throw new ApiError("REFUND_WRITE_FAILED", "ثبت بازپرداخت انجام نشد.", 500);
            const transaction = await this.ledger.refundBooking(
              userId,
              String(booking.organizationId),
              String(refund._id),
              calculation.totalMinor,
              calculation.refundableMinor,
              calculation.penaltyMinor,
              calculation.currency,
              key,
              session,
            );
            refund.status = "paid";
            refund.ledgerTransactionId = transaction._id;
            refund.refundedAt = new Date();
            await refund.save({ session });
            const paymentStatus =
              calculation.refundableMinor === calculation.totalMinor
                ? "refunded"
                : calculation.refundableMinor === "0"
                  ? "retained"
                  : "partially_refunded";
            booking.payment.status = paymentStatus;
            payment.status = paymentStatus;
            payment.updatedBy = objectIdFrom(userId);
            await payment.save({ session });
          } else {
            calculation = {
              ...calculation,
              penaltyMinor: "0",
              refundableMinor: "0",
              paymentStatus: booking.payment?.status ?? "unpaid",
            };
          }
          booking.status = "cancelled";
          booking.cancellation = {
            reason,
            calculation,
            cancelledAt: new Date(),
            cancelledBy: objectIdFrom(userId),
            source: "customer",
          };
          await booking.save({ session });
          if (booking.seriesId) {
            const active = await this.models.Booking.countDocuments({
              seriesId: booking.seriesId,
              status: { $ne: "cancelled" },
            }).session(session);
            if (!active)
              await this.models.BookingSeries.updateOne(
                { _id: booking.seriesId },
                { $set: { status: "cancelled" } },
                { session },
              );
          }
          await this.models.OutboxEvent.create(
            [
              {
                type: "booking.cancelled",
                aggregate: { type: "booking", id: booking._id },
                payload: { customerUserId: userId, calculation },
                status: "pending",
              },
            ],
            { session },
          );
          return booking.toObject();
        },
      ),
    );
  }
  async adminCancel(
    actorUserId: string,
    bookingId: string,
    reason: string,
    key: string,
    requestId?: string,
  ) {
    const booking = (await this.models.Booking.findById(objectIdFrom(bookingId)).lean()) as any;
    if (!booking) throw new ApiError("BOOKING_NOT_FOUND", "رزرو پیدا نشد.", 404);
    const result = await this.cancel(String(booking.customerUserId), bookingId, reason, key);
    await this.audit.record({
      actorUserId,
      action: "booking.admin_cancelled",
      entityType: "booking",
      entityId: bookingId,
      organizationId: String(booking.organizationId),
      before: booking,
      after: result as any,
      requestId,
    });
    return result;
  }
  async get(userId: string, bookingId: string) {
    const booking = (await this.models.Booking.findOne({
      _id: objectIdFrom(bookingId),
      customerUserId: objectIdFrom(userId),
    }).lean()) as any;
    if (!booking) throw new ApiError("BOOKING_NOT_FOUND", "رزرو پیدا نشد.", 404);
    const branch = (await this.models.Branch.findById(booking.branchId).lean()) as any;
    const [offering, club] = await Promise.all([
      this.models.Offering.findById(booking.offeringId).lean(),
      branch ? this.models.Club.findById(branch.clubId).lean() : null,
    ]);
    return { ...booking, branch: branch ?? null, club: club ?? null, offering: offering ?? null };
  }
  async mine(userId: string, query: any) {
    const filter: any = {
      customerUserId: objectIdFrom(userId),
      ...(query.status ? { status: query.status } : {}),
      ...(query.from || query.to
        ? {
            "allocations.startAt": {
              ...(query.from ? { $gte: query.from } : {}),
              ...(query.to ? { $lte: query.to } : {}),
            },
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.models.Booking.find(filter)
        .sort({ "allocations.startAt": -1 })
        .skip(paginationOffset(query))
        .limit(query.limit)
        .lean(),
      this.models.Booking.countDocuments(filter),
    ]);
    const branches = (await this.models.Branch.find({
      _id: { $in: (items as any[]).map((item) => item.branchId) },
    }).lean()) as any[];
    const offerings = (await this.models.Offering.find({
      _id: { $in: (items as any[]).map((item) => item.offeringId) },
    }).lean()) as any[];
    const clubs = (await this.models.Club.find({
      _id: { $in: branches.map((item) => item.clubId) },
    }).lean()) as any[];
    return {
      items: (items as any[]).map((item) => {
        const branch = branches.find((value) => String(value._id) === String(item.branchId));
        const offering = offerings.find((value) => String(value._id) === String(item.offeringId));
        return {
          ...item,
          branch,
          club: clubs.find((value) => String(value._id) === String(branch?.clubId)),
          offering,
        };
      }),
      total,
    };
  }
  async branch(userId: string, branchId: string, query: any) {
    await this.access.assertBranch(userId, branchId, PERMISSIONS.BRANCH_BOOKING_READ);
    const filter: any = {
      branchId: objectIdFrom(branchId),
      ...(query.status ? { status: query.status } : {}),
    };
    const [items, total] = await Promise.all([
      this.models.Booking.find(filter)
        .sort({ "allocations.startAt": -1 })
        .skip(paginationOffset(query))
        .limit(query.limit)
        .lean(),
      this.models.Booking.countDocuments(filter),
    ]);
    return { items, total };
  }
  async admin(query: any) {
    const filter: any = { ...(query.status ? { status: query.status } : {}) };
    const [items, total] = await Promise.all([
      this.models.Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip(paginationOffset(query))
        .limit(query.limit)
        .lean(),
      this.models.Booking.countDocuments(filter),
    ]);
    return { items, total };
  }
}
