import { Inject, Injectable } from "@nestjs/common";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { ApiError } from "../../common/api-error.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { AvailabilityService } from "../supply/availability.service.js";
import { QuoteService } from "./quote.service.js";
import { BookingService } from "./booking.service.js";

@Injectable()
export class WaitlistService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly availability: AvailabilityService,
    private readonly quotes: QuoteService,
    private readonly bookings: BookingService,
  ) {}

  async join(
    userId: string,
    input: { offering_id: string; branch_id: string; starts_at: Date; participants: number },
  ) {
    const offering = (await this.models.Offering.findOne({
      _id: objectIdFrom(input.offering_id),
      branchIds: objectIdFrom(input.branch_id),
      status: "active",
    }).lean()) as any;
    if (!offering) throw new ApiError("OFFERING_NOT_AVAILABLE", "خدمت فعال پیدا نشد.", 404);
    const duration = Number(offering.bookingSettings?.durationMinutes ?? 60);
    const endsAt = new Date(input.starts_at.getTime() + duration * 60_000);
    const resourceIds = (offering.resourceRequirements ?? [])
      .filter((item: any) => item.mode !== "optional")
      .map((item: any) => String(item.resourceId));
    if (!resourceIds.length)
      throw new ApiError(
        "OFFERING_HAS_NO_RESOURCE",
        "برای این خدمت منبع رزرو تعریف نشده است.",
        409,
      );
    const checks = await Promise.all(
      resourceIds.map((resourceId: string) =>
        this.availability.slots(resourceId, {
          from: input.starts_at,
          to: endsAt,
          duration_minutes: duration,
          participants: input.participants,
        }),
      ),
    );
    const available = checks.every((result) =>
      result.slots.some(
        (slot: { startAt: string; status: string }) =>
          slot.startAt === input.starts_at.toISOString() && slot.status === "available",
      ),
    );
    if (available)
      throw new ApiError(
        "SLOT_IS_AVAILABLE",
        "این سانس اکنون ظرفیت دارد و می‌توانید مستقیم رزرو کنید.",
        409,
      );
    try {
      return await this.models.WaitlistEntry.create({
        customerUserId: objectIdFrom(userId),
        organizationId: offering.organizationId,
        branchId: objectIdFrom(input.branch_id),
        offeringId: offering._id,
        request: {
          startsAt: input.starts_at,
          endsAt,
          participants: input.participants,
          resourceIds: resourceIds.map(objectIdFrom),
        },
        status: "waiting",
        createdBy: objectIdFrom(userId),
      });
    } catch (error: any) {
      if (error?.code === 11000)
        throw new ApiError(
          "WAITLIST_ALREADY_JOINED",
          "قبلاً برای این سانس در لیست انتظار هستید.",
          409,
        );
      throw error;
    }
  }

  async mine(userId: string) {
    return this.models.WaitlistEntry.find({
      customerUserId: objectIdFrom(userId),
      status: { $in: ["waiting", "offered"] },
    })
      .sort({ "request.startsAt": 1 })
      .lean();
  }
  async leave(userId: string, entryId: string) {
    const item = await this.models.WaitlistEntry.findOneAndUpdate(
      {
        _id: objectIdFrom(entryId),
        customerUserId: objectIdFrom(userId),
        status: { $in: ["waiting", "offered"] },
      },
      { $set: { status: "cancelled", updatedBy: objectIdFrom(userId) } },
      { returnDocument: "after" },
    ).lean();
    if (!item)
      throw new ApiError("WAITLIST_ENTRY_NOT_FOUND", "عضویت فعال در لیست انتظار پیدا نشد.", 404);
    return item;
  }

  async claim(userId: string, entryId: string, key: string) {
    const entry = (await this.models.WaitlistEntry.findOne({
      _id: objectIdFrom(entryId),
      customerUserId: objectIdFrom(userId),
      status: "offered",
      "notification.expiresAt": { $gt: new Date() },
    }).lean()) as any;
    if (!entry)
      throw new ApiError(
        "WAITLIST_OFFER_UNAVAILABLE",
        "پیشنهاد لیست انتظار معتبر نیست یا مهلت آن تمام شده است.",
        409,
      );
    const participants = Array.from(
      { length: Number(entry.request?.participants ?? 1) },
      (_, index) =>
        index === 0
          ? { kind: "self" }
          : { kind: "guest", profile: { full_name: `همراه ${index}` } },
    );
    const quote = await this.quotes.create(
      userId,
      {
        offering_id: String(entry.offeringId),
        branch_id: String(entry.branchId),
        starts_at: new Date(entry.request.startsAt),
        participants,
      },
      `${key}:quote`,
    );
    const hold = await this.bookings.createHold(userId, String((quote as any)._id), `${key}:hold`);
    const result = await this.bookings.checkout(
      userId,
      { hold_token: hold.holdToken, payment_method: "sandbox_gateway" },
      `${key}:checkout`,
    );
    await this.models.WaitlistEntry.updateOne(
      { _id: objectIdFrom(entryId), status: "offered" },
      { $set: { status: "claimed", claimedAt: new Date(), updatedBy: objectIdFrom(userId) } },
    );
    return result;
  }
}
