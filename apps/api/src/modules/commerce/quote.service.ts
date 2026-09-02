import { Inject, Injectable } from "@nestjs/common";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { ApiError } from "../../common/api-error.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { AvailabilityService } from "../supply/availability.service.js";
import { IdempotencyService } from "./idempotency.service.js";
import { TaxCalculationService } from "./tax-calculation.service.js";

@Injectable()
export class QuoteService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly availability: AvailabilityService,
    private readonly idempotency: IdempotencyService,
    private readonly taxes: TaxCalculationService,
  ) {}
  private occurrences(
    startsAt: Date,
    durationMinutes: number,
    recurrence?: { interval: number; occurrences: number },
  ) {
    return Array.from({ length: recurrence?.occurrences ?? 1 }, (_, index) => {
      const start = new Date(
        startsAt.getTime() + index * (recurrence?.interval ?? 1) * 7 * 86_400_000,
      );
      return {
        index,
        startsAt: start,
        endsAt: new Date(start.getTime() + durationMinutes * 60_000),
      };
    });
  }
  async create(userId: string, input: any, key: string) {
    return this.idempotency.execute(userId, "booking.quote.create", key, input, async () => {
      const offering = (await this.models.Offering.findOne({
        _id: objectIdFrom(input.offering_id),
        status: "active",
        branchIds: objectIdFrom(input.branch_id),
      }).lean()) as any;
      if (!offering)
        throw new ApiError("OFFERING_NOT_AVAILABLE", "خدمت فعال برای این شعبه پیدا نشد.", 404);
      const participantCount = input.participants.length;
      if (
        participantCount < (offering.capacity?.minimum ?? 1) ||
        participantCount > offering.capacity?.maximum
      )
        throw new ApiError(
          "INVALID_PARTICIPANT_COUNT",
          "تعداد شرکت‌کنندگان با ظرفیت خدمت سازگار نیست.",
          422,
        );
      const householdIds = input.participants
        .filter((item: any) => item.kind === "household_member")
        .map((item: any) => item.reference_id);
      if (householdIds.length) {
        const household = await this.models.Household.findOne({
          ownerUserId: objectIdFrom(userId),
          "members.id": { $all: householdIds },
          status: "active",
        }).lean();
        if (!household)
          throw new ApiError("INVALID_HOUSEHOLD_MEMBER", "یکی از اعضای خانواده معتبر نیست.", 422);
      }
      const durationMinutes = offering.bookingSettings?.durationMinutes ?? 60;
      const occurrences = this.occurrences(input.starts_at, durationMinutes, input.recurrence);
      const requirements = (offering.resourceRequirements ?? []).filter(
        (item: any) => item.mode !== "optional",
      );
      if (!requirements.length)
        throw new ApiError(
          "OFFERING_HAS_NO_RESOURCE",
          "برای این خدمت منبع قابل رزرو تعریف نشده است.",
          409,
        );
      const allocations: any[] = [];
      for (const occurrence of occurrences)
        for (const requirement of requirements) {
          const result = await this.availability.slots(String(requirement.resourceId), {
            from: occurrence.startsAt,
            to: occurrence.endsAt,
            duration_minutes: durationMinutes,
            participants: participantCount,
          });
          const slot = result.slots.find(
            (item) =>
              item.startAt === occurrence.startsAt.toISOString() &&
              item.endAt === occurrence.endsAt.toISOString() &&
              item.status === "available",
          );
          if (!slot)
            throw new ApiError(
              "SLOT_NOT_AVAILABLE",
              "یکی از زمان‌های انتخاب‌شده دیگر در دسترس نیست.",
              409,
              {
                occurrence_index: occurrence.index,
                resource_id: String(requirement.resourceId),
                starts_at: occurrence.startsAt.toISOString(),
              },
            );
          allocations.push({
            occurrenceIndex: occurrence.index,
            resourceId: requirement.resourceId,
            startAt: occurrence.startsAt,
            endAt: occurrence.endsAt,
            quantity: participantCount,
          });
        }
      const unit = BigInt(String(offering.pricing?.baseAmount ?? 0));
      const unitsPerOccurrence =
        offering.pricing?.pricingMode === "per_person" ? BigInt(participantCount) : 1n;
      const subtotal = unit * unitsPerOccurrence * BigInt(occurrences.length);
      const tax = await this.taxes.calculate({
        organizationId: String(offering.organizationId),
        branchId: input.branch_id,
        offeringId: String(offering._id),
        grossMinor: subtotal.toString(),
        currency: offering.pricing?.currency ?? "IRR",
        offeringTaxIncluded: Boolean(offering.pricing?.taxIncluded),
      });
      const pricing = {
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
      return this.models.PricingQuote.create({
        customerUserId: objectIdFrom(userId),
        organizationId: offering.organizationId,
        branchId: objectIdFrom(input.branch_id),
        offeringId: offering._id,
        occurrences: occurrences.map((item) => ({
          ...item,
          allocations: allocations.filter(
            (allocation) => allocation.occurrenceIndex === item.index,
          ),
        })),
        participants: input.participants,
        pricing,
        promotion: input.promotion_code
          ? { code: input.promotion_code, status: "not_applied" }
          : undefined,
        snapshot: {
          offering: {
            id: offering._id,
            profile: offering.profile,
            bookingSettings: offering.bookingSettings,
            pricing: offering.pricing,
          },
        },
        expiresAt: new Date(Date.now() + 10 * 60_000),
        status: "active",
        createdBy: objectIdFrom(userId),
      });
    });
  }
  async get(userId: string, quoteId: string) {
    const quote = await this.models.PricingQuote.findOne({
      _id: objectIdFrom(quoteId),
      customerUserId: objectIdFrom(userId),
    }).lean();
    if (!quote) throw new ApiError("QUOTE_NOT_FOUND", "پیش‌فاکتور پیدا نشد.", 404);
    return quote;
  }
}
