import { Inject, Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { PERMISSIONS } from "../../security/rbac.js";
import { ApiError } from "../../common/api-error.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { AuditService } from "../audit/audit.service.js";
import { OrganizationAccessService } from "../organization/organization-access.service.js";
import { withTransaction } from "./commerce.transaction.js";
import { MembershipCoverageService } from "./membership-coverage.service.js";

const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const participantKey = (participant: any, index: number) =>
  `${participant?.kind ?? "guest"}:${participant?.reference_id ?? participant?.referenceId ?? index}`;

@Injectable()
export class AccessPassService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly access: OrganizationAccessService,
    private readonly audit: AuditService,
    private readonly membershipCoverage: MembershipCoverageService,
  ) {}

  async issue(userId: string, bookingId: string, indexes?: number[]) {
    const booking = (await this.models.Booking.findOne({
      _id: objectIdFrom(bookingId),
      customerUserId: objectIdFrom(userId),
    }).lean()) as any;
    if (!booking) throw new ApiError("BOOKING_NOT_FOUND", "رزرو پیدا نشد.", 404);
    if (!["confirmed", "checked_in"].includes(booking.status))
      throw new ApiError(
        "ACCESS_PASS_UNAVAILABLE",
        "برای این وضعیت رزرو امکان صدور مجوز ورود وجود ندارد.",
        409,
      );
    const allocations = booking.allocations ?? [];
    const startsAt = new Date(
      Math.min(...allocations.map((item: any) => new Date(item.startAt).getTime())),
    );
    const endsAt = new Date(
      Math.max(...allocations.map((item: any) => new Date(item.endAt).getTime())),
    );
    const selected = new Set<number>(
      indexes ?? booking.participants.map((_: unknown, index: number) => index),
    );
    if ([...selected].some((index) => !booking.participants[index]))
      throw new ApiError("PARTICIPANT_NOT_FOUND", "یکی از شرکت‌کنندگان پیدا نشد.", 422);
    const result: Array<{ pass: unknown; token: string }> = [];
    for (const [index, participant] of booking.participants.entries()) {
      if (!selected.has(index)) continue;
      const key = participantKey(participant, index);
      await this.models.AccessPass.updateMany(
        { bookingId: booking._id, "participant.key": key, status: "issued" },
        { $set: { status: "revoked", revokedAt: new Date(), updatedBy: objectIdFrom(userId) } },
      );
      const token = randomBytes(32).toString("base64url");
      const pass = await this.models.AccessPass.create({
        bookingId: booking._id,
        participant: {
          key,
          kind: participant.kind,
          referenceId: participant.reference_id ?? participant.referenceId,
          profile: participant.profile,
        },
        branchId: booking.branchId,
        tokenHash: hash(token),
        validity: {
          startsAt: new Date(startsAt.getTime() - 120 * 60_000),
          endsAt: new Date(endsAt.getTime() + 180 * 60_000),
        },
        status: "issued",
        createdBy: objectIdFrom(userId),
      });
      result.push({ pass: pass.toObject(), token });
    }
    return result;
  }

  async mine(userId: string, raw: unknown) {
    const query = (raw ?? {}) as Record<string, unknown>;
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? query.page_size ?? 50)));
    return this.models.CheckIn.find({ userId: objectIdFrom(userId) })
      .sort({ checkedInAt: -1 })
      .limit(limit)
      .lean();
  }

  async checkIn(actorUserId: string, branchId: string, token: string, requestId?: string) {
    const context = await this.access.assertBranch(
      actorUserId,
      branchId,
      PERMISSIONS.BRANCH_CHECK_IN_CREATE,
    );
    const result = await withTransaction(
      () => this.models.AccessPass.db.startSession(),
      async (session) => {
        const now = new Date();
        const pass = (await this.models.AccessPass.findOne({ tokenHash: hash(token) })
          .select("+tokenHash")
          .session(session)) as any;
        if (!pass || String(pass.branchId) !== branchId)
          throw new ApiError("ACCESS_PASS_INVALID", "کد ورود معتبر نیست.", 404);
        if (pass.status !== "issued")
          throw new ApiError(
            "ACCESS_PASS_ALREADY_USED",
            "این کد قبلاً استفاده یا باطل شده است.",
            409,
          );
        if (pass.validity.startsAt > now || pass.validity.endsAt < now)
          throw new ApiError("ACCESS_PASS_OUTSIDE_WINDOW", "کد خارج از بازه مجاز ورود است.", 409);
        const booking = (await this.models.Booking.findById(pass.bookingId).session(
          session,
        )) as any;
        if (!booking || !["confirmed", "checked_in"].includes(booking.status))
          throw new ApiError("BOOKING_NOT_CHECKABLE", "رزرو در وضعیت قابل پذیرش نیست.", 409);
        pass.status = "used";
        pass.usedAt = now;
        pass.updatedBy = objectIdFrom(actorUserId);
        await pass.save({ session });
        const [checkIn] = await this.models.CheckIn.create(
          [
            {
              bookingId: booking._id,
              accessPassId: pass._id,
              participant: pass.participant,
              userId: booking.customerUserId,
              branchId: booking.branchId,
              method: "qr",
              checkedInAt: now,
              performedBy: objectIdFrom(actorUserId),
              status: "checked_in",
              createdBy: objectIdFrom(actorUserId),
            },
          ],
          { session },
        );
        booking.status = "checked_in";
        await booking.save({ session });
        if (booking.payment?.method === "membership")
          await this.membershipCoverage.consumeBooking(String(booking._id), actorUserId, session);
        await this.models.OutboxEvent.create(
          [
            {
              type: "booking.checked_in",
              aggregate: { type: "booking", id: booking._id },
              payload: { checkInId: checkIn!._id, customerUserId: booking.customerUserId },
              status: "pending",
            },
          ],
          { session },
        );
        return { booking: booking.toObject(), checkIn: checkIn!.toObject() };
      },
    );
    await this.audit.record({
      actorUserId,
      action: "booking.checked_in",
      entityType: "booking",
      entityId: String((result.booking as any)._id),
      organizationId: context.organizationId,
      after: result,
      requestId,
    });
    return result;
  }

  async checkOut(
    actorUserId: string,
    branchId: string,
    checkInId: string,
    note?: string,
    requestId?: string,
  ) {
    const context = await this.access.assertBranch(
      actorUserId,
      branchId,
      PERMISSIONS.BRANCH_CHECK_OUT_CREATE,
    );
    const checkIn = (await this.models.CheckIn.findOneAndUpdate(
      { _id: objectIdFrom(checkInId), branchId: objectIdFrom(branchId), status: "checked_in" },
      {
        $set: {
          status: "checked_out",
          checkedOutAt: new Date(),
          ...(note ? { "checkout.note": note } : {}),
          updatedBy: objectIdFrom(actorUserId),
        },
      },
      { returnDocument: "after" },
    ).lean()) as any;
    if (!checkIn)
      throw new ApiError(
        "CHECK_IN_NOT_ACTIVE",
        "ورود فعال پیدا نشد یا قبلاً خروج ثبت شده است.",
        409,
      );
    const activeCount = await this.models.CheckIn.countDocuments({
      bookingId: checkIn.bookingId,
      status: "checked_in",
    });
    if (!activeCount)
      await this.models.Booking.updateOne(
        { _id: checkIn.bookingId, status: "checked_in" },
        { $set: { status: "completed", updatedBy: objectIdFrom(actorUserId) } },
      );
    await this.audit.record({
      actorUserId,
      action: "booking.checked_out",
      entityType: "check_in",
      entityId: checkInId,
      organizationId: context.organizationId,
      after: checkIn,
      requestId,
    });
    return checkIn;
  }
}
