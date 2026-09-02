import { z } from "zod";
import {
  ACTIVE_INACTIVE_STATUSES,
  GENDER_POLICIES,
  PROVIDER_TYPES,
  SERVICE_MODES,
} from "../../../common/enums/index.js";
import {
  AVAILABILITY_EXCEPTION_TYPES,
  CAPACITY_MODES,
  LIFECYCLE_STATUSES,
  OFFERING_CREATE_STATUSES,
  OFFERING_STATUSES,
  OFFERING_TYPES,
  PRICING_MODES,
  REQUIREMENT_MODES,
  RESOURCE_CREATE_STATUSES,
  RESOURCE_STATUSES,
} from "../enums/index.js";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "شناسه معتبر نیست");
const jsonObject = z.record(z.string(), z.unknown());
const localized = z.record(z.string(), z.string());
const slug = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const clock = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

const resourceProfile = z.object({
  name: z.string().trim().min(2).max(160),
  slug,
  description: localized.optional(),
  sports: z.array(z.string().min(1)).max(30).default([]),
  gender_policy: z.enum(GENDER_POLICIES).default("all"),
  amenities: z.array(z.string().min(1)).max(100).default([]),
  equipment: z.array(jsonObject).max(200).default([]),
  images: z.array(jsonObject).max(30).default([]),
});
const resourceCapacity = z.object({
  mode: z.enum(CAPACITY_MODES).default("exclusive"),
  total: z.number().int().min(1).max(100_000),
  minimum_participants: z.number().int().min(1).default(1),
  maximum_participants: z.number().int().min(1).optional(),
});
const resourceBookingSettings = z.object({
  slot_duration_minutes: z.number().int().min(5).max(1440).default(60),
  booking_window_days: z.number().int().min(1).max(365).default(30),
  minimum_advance_minutes: z.number().int().min(0).max(525_600).default(60),
  buffer_before_minutes: z.number().int().min(0).max(1440).default(0),
  buffer_after_minutes: z.number().int().min(0).max(1440).default(0),
  allow_recurring: z.boolean().default(true),
  allow_group: z.boolean().default(true),
});
export const resourceCreateSchema = z
  .object({
    type: z.string().trim().min(2).max(80),
    profile: resourceProfile,
    capacity: resourceCapacity,
    booking_settings: resourceBookingSettings.optional().default({
      slot_duration_minutes: 60,
      booking_window_days: 30,
      minimum_advance_minutes: 60,
      buffer_before_minutes: 0,
      buffer_after_minutes: 0,
      allow_recurring: true,
      allow_group: true,
    }),
    custom_data: jsonObject.optional(),
    status: z.enum(RESOURCE_CREATE_STATUSES).default("draft"),
  })
  .superRefine((value, ctx) => {
    if (
      value.capacity.maximum_participants &&
      value.capacity.maximum_participants > value.capacity.total
    )
      ctx.addIssue({
        code: "custom",
        path: ["capacity", "maximum_participants"],
        message: "حداکثر شرکت‌کننده نمی‌تواند بیشتر از ظرفیت باشد",
      });
  });
export const resourcePatchSchema = z.object({
  type: z.string().trim().min(2).max(80).optional(),
  profile: resourceProfile.partial().optional(),
  capacity: resourceCapacity.partial().optional(),
  booking_settings: resourceBookingSettings.partial().optional(),
  custom_data: jsonObject.optional(),
  status: z.enum(RESOURCE_STATUSES).optional(),
});

const offeringProfile = z.object({
  name: z.string().trim().min(2).max(160),
  slug,
  type: z.enum(OFFERING_TYPES),
  description: localized.optional(),
  sport: z.string().max(80).optional(),
  service_mode: z.enum(SERVICE_MODES).default("in_person"),
  images: z.array(jsonObject).max(30).default([]),
});
const offeringPricing = z.object({
  currency: z.string().length(3).default("IRR"),
  base_amount: z.number().int().min(0),
  pricing_mode: z.enum(PRICING_MODES).default("per_booking"),
  tax_included: z.boolean().default(false),
});
const offeringCapacity = z.object({
  mode: z.enum(CAPACITY_MODES).default("shared"),
  minimum: z.number().int().min(1).default(1),
  maximum: z.number().int().min(1).max(100_000),
});
const offeringBookingSettings = z.object({
  duration_minutes: z.number().int().min(5).max(1440),
  booking_window_days: z.number().int().min(1).max(365).default(30),
  minimum_advance_minutes: z.number().int().min(0).default(60),
  cancellation_window_minutes: z.number().int().min(0).default(720),
  allow_recurring: z.boolean().default(true),
  allow_group: z.boolean().default(true),
  allow_family: z.boolean().default(true),
});
export const offeringCreateSchema = z
  .object({
    branch_ids: z.array(objectId).min(1).max(100),
    resource_requirements: z
      .array(
        z.object({
          resource_id: objectId,
          quantity: z.number().int().min(1).default(1),
          mode: z.enum(REQUIREMENT_MODES).default("required"),
        }),
      )
      .max(20)
      .default([]),
    provider: z
      .object({
        type: z.enum(PROVIDER_TYPES).default("organization"),
        coach_profile_id: objectId.optional(),
        coach_user_id: objectId.optional(),
      })
      .optional(),
    revenue_share: z
      .object({ coach_percentage_bps: z.number().int().min(0).max(10000).default(0) })
      .optional(),
    profile: offeringProfile,
    pricing: offeringPricing,
    capacity: offeringCapacity,
    booking_settings: offeringBookingSettings,
    custom_data: jsonObject.optional(),
    status: z.enum(OFFERING_CREATE_STATUSES).default("draft"),
  })
  .superRefine((value, ctx) => {
    if (value.capacity.minimum > value.capacity.maximum)
      ctx.addIssue({
        code: "custom",
        path: ["capacity", "minimum"],
        message: "حداقل ظرفیت نمی‌تواند بیشتر از حداکثر باشد",
      });
  });
export const offeringPatchSchema = z.object({
  branch_ids: z.array(objectId).min(1).max(100).optional(),
  resource_requirements: z
    .array(
      z.object({
        resource_id: objectId,
        quantity: z.number().int().min(1),
        mode: z.enum(REQUIREMENT_MODES),
      }),
    )
    .max(20)
    .optional(),
  provider: z
    .object({
      type: z.enum(PROVIDER_TYPES).optional(),
      coach_profile_id: objectId.optional(),
      coach_user_id: objectId.optional(),
    })
    .optional(),
  revenue_share: z
    .object({ coach_percentage_bps: z.number().int().min(0).max(10000).optional() })
    .optional(),
  profile: offeringProfile.partial().optional(),
  pricing: offeringPricing.partial().optional(),
  capacity: offeringCapacity.partial().optional(),
  booking_settings: offeringBookingSettings.partial().optional(),
  custom_data: jsonObject.optional(),
  status: z.enum(OFFERING_STATUSES).optional(),
});

const availabilityRuleBaseSchema = z.object({
  schedule: z.object({
    day_of_week: z.number().int().min(0).max(6),
    periods: z
      .array(
        z
          .object({ starts_at: clock, ends_at: clock })
          .refine((item) => item.starts_at < item.ends_at, "زمان پایان باید بعد از شروع باشد"),
      )
      .min(1)
      .max(8),
  }),
  validity: z
    .object({ starts_on: z.coerce.date().optional(), ends_on: z.coerce.date().optional() })
    .default({}),
  capacity: z.object({ total: z.number().int().min(1).optional() }).default({}),
  priority: z.number().int().min(-100).max(100).default(0),
  status: z.enum(ACTIVE_INACTIVE_STATUSES).default("active"),
});
export const availabilityRuleSchema = availabilityRuleBaseSchema.superRefine((value, ctx) => {
  if (
    value.validity.starts_on &&
    value.validity.ends_on &&
    value.validity.starts_on >= value.validity.ends_on
  )
    ctx.addIssue({
      code: "custom",
      path: ["validity", "ends_on"],
      message: "پایان اعتبار باید بعد از شروع باشد",
    });
});
export const availabilityRulePatchSchema = availabilityRuleBaseSchema.partial();
const availabilityExceptionBaseSchema = z.object({
  type: z.enum(AVAILABILITY_EXCEPTION_TYPES),
  period: z.object({ starts_at: z.coerce.date(), ends_at: z.coerce.date() }),
  capacity: z.object({ total: z.number().int().min(0).optional() }).default({}),
  reason: z.string().trim().max(500).optional(),
  status: z.enum(ACTIVE_INACTIVE_STATUSES).default("active"),
});
export const availabilityExceptionSchema = availabilityExceptionBaseSchema.superRefine(
  (value, ctx) => {
    if (value.period.starts_at >= value.period.ends_at)
      ctx.addIssue({
        code: "custom",
        path: ["period", "ends_at"],
        message: "پایان بازه باید بعد از شروع باشد",
      });
  },
);
export const availabilityExceptionPatchSchema = availabilityExceptionBaseSchema.partial();

export const slotQuerySchema = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date(),
    duration_minutes: z.coerce.number().int().min(5).max(1440).optional(),
    participants: z.coerce.number().int().min(1).max(100_000).default(1),
    exclude_booking_id: objectId.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.from >= value.to)
      ctx.addIssue({ code: "custom", path: ["to"], message: "پایان بازه باید بعد از شروع باشد" });
    if (value.to.getTime() - value.from.getTime() > 31 * 86_400_000)
      ctx.addIssue({ code: "custom", path: ["to"], message: "حداکثر بازه جست‌وجو ۳۱ روز است" });
  });
export const catalogListSchema = z.object({
  type: z.string().optional(),
  sport: z.string().optional(),
  gender_policy: z.string().optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export const catalogBranchSearchSchema = z
  .object({
    search: z.string().trim().max(100).optional(),
    sport: z.string().trim().max(80).optional(),
    city: z.string().trim().max(100).optional(),
    district: z.string().trim().max(100).optional(),
    gender_policy: z.enum(GENDER_POLICIES).optional(),
    amenities: z.string().trim().max(500).optional(),
    min_rating: z.coerce.number().min(1).max(5).optional(),
    min_price: z.coerce.number().int().min(0).optional(),
    max_price: z.coerce.number().int().min(0).optional(),
    open_now: z.coerce.boolean().optional(),
    has_online_booking: z.coerce.boolean().optional(),
    has_active_coach: z.coerce.boolean().optional(),
    membership_available: z.coerce.boolean().optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    radius_km: z.coerce.number().min(1).max(200).default(25),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .superRefine((value, ctx) => {
    if ((value.latitude === undefined) !== (value.longitude === undefined))
      ctx.addIssue({ code: "custom", message: "مختصات باید کامل ارسال شود", path: ["latitude"] });
    if (
      value.min_price !== undefined &&
      value.max_price !== undefined &&
      value.min_price > value.max_price
    )
      ctx.addIssue({
        code: "custom",
        message: "حداقل قیمت نمی‌تواند بیشتر از حداکثر باشد",
        path: ["min_price"],
      });
  });
export const lifecycleStatusSchema = z.object({
  status: z.enum(LIFECYCLE_STATUSES),
  reason: z.string().trim().max(1000).optional(),
});
