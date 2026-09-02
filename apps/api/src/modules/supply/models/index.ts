import { PROVIDER_TYPES } from "../../../common/enums/index.js";
import { audit, createSchema, customData, mixed, objectId } from "../../../database/mongoose.js";

export const supplyModels = {
  Resource: createSchema({
    branchId: { type: objectId, ref: "Branch", required: true, index: true },
    type: { type: String, required: true, index: true },
    profile: {
      name: { type: String, required: true },
      slug: { type: String, required: true },
      description: mixed,
      sports: [String],
      genderPolicy: String,
      amenities: [String],
      equipment: [mixed],
      images: [mixed],
    },
    capacity: {
      mode: { type: String, default: "exclusive" },
      total: { type: Number, required: true, min: 1 },
      minimumParticipants: { type: Number, default: 1 },
      maximumParticipants: Number,
    },
    bookingSettings: {
      slotDurationMinutes: { type: Number, default: 60 },
      bookingWindowDays: { type: Number, default: 30 },
      minimumAdvanceMinutes: { type: Number, default: 60 },
      bufferBeforeMinutes: { type: Number, default: 0 },
      bufferAfterMinutes: { type: Number, default: 0 },
      allowRecurring: { type: Boolean, default: true },
      allowGroup: { type: Boolean, default: true },
    },
    bookingRevision: { type: Number, default: 0, select: false },
    customData,
    status: { type: String, default: "draft", index: true },
    ...audit,
  }),
  Offering: createSchema({
    organizationId: { type: objectId, ref: "Organization", required: true, index: true },
    branchIds: [{ type: objectId, ref: "Branch", required: true }],
    resourceRequirements: [
      {
        resourceId: { type: objectId, ref: "Resource", required: true },
        quantity: { type: Number, default: 1 },
        mode: { type: String, default: "required" },
      },
    ],
    provider: {
      type: { type: String, enum: PROVIDER_TYPES, default: "organization" },
      coachProfileId: { type: objectId, ref: "CoachProfile", index: true },
      coachUserId: { type: objectId, ref: "User" },
    },
    revenueShare: {
      coachPercentageBps: { type: Number, min: 0, max: 10000, default: 0 },
    },
    profile: {
      name: { type: String, required: true },
      slug: { type: String, required: true },
      type: { type: String, required: true },
      description: mixed,
      sport: String,
      serviceMode: { type: String, default: "in_person" },
      images: [mixed],
    },
    pricing: {
      currency: { type: String, default: "IRR" },
      baseAmount: { type: Number, required: true, min: 0 },
      pricingMode: { type: String, default: "per_booking" },
      taxIncluded: { type: Boolean, default: false },
    },
    capacity: {
      mode: { type: String, default: "shared" },
      minimum: { type: Number, default: 1 },
      maximum: { type: Number, required: true, min: 1 },
    },
    bookingSettings: {
      durationMinutes: { type: Number, required: true },
      bookingWindowDays: { type: Number, default: 30 },
      minimumAdvanceMinutes: { type: Number, default: 60 },
      cancellationWindowMinutes: { type: Number, default: 720 },
      allowRecurring: { type: Boolean, default: true },
      allowGroup: { type: Boolean, default: true },
      allowFamily: { type: Boolean, default: true },
    },
    customData,
    status: { type: String, default: "draft", index: true },
    ...audit,
  }),
  AvailabilityRule: createSchema({
    resourceId: { type: objectId, ref: "Resource", required: true, index: true },
    schedule: {
      dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
      periods: [
        { startsAt: { type: String, required: true }, endsAt: { type: String, required: true } },
      ],
    },
    validity: { startsOn: Date, endsOn: Date },
    capacity: { total: Number },
    priority: { type: Number, default: 0 },
    status: { type: String, default: "active", index: true },
    ...audit,
  }),
  AvailabilityException: createSchema({
    resourceId: { type: objectId, ref: "Resource", required: true, index: true },
    type: { type: String, required: true },
    period: { startsAt: { type: Date, required: true }, endsAt: { type: Date, required: true } },
    capacity: { total: Number },
    reason: String,
    status: { type: String, default: "active", index: true },
    ...audit,
  }),
} as const;

supplyModels.Resource.index({ branchId: 1, "profile.slug": 1 }, { unique: true });
supplyModels.Offering.index({ "provider.coachProfileId": 1, status: 1 });
supplyModels.Resource.index({ branchId: 1, status: 1, type: 1 });
supplyModels.Offering.index({ organizationId: 1, "profile.slug": 1 }, { unique: true });
supplyModels.Offering.index({ branchIds: 1, status: 1, "profile.type": 1 });
supplyModels.AvailabilityRule.index({ resourceId: 1, status: 1, "schedule.dayOfWeek": 1 });
supplyModels.AvailabilityException.index({
  resourceId: 1,
  status: 1,
  "period.startsAt": 1,
  "period.endsAt": 1,
});
