import { z } from "zod";
import { ACTIVE_INACTIVE_STATUSES, SERVICE_MODES, VERIFICATION_DECISIONS } from "../../../common/enums/index.js";
import {
  COACH_GENDERS,
  COACH_SERVICE_MODES,
  COACH_SERVICE_TYPES,
  COACHING_STATUS_UPDATES,
} from "../enums/index.js";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "شناسه معتبر نیست");
const localized = z.record(z.string(), z.string());
const json = z.record(z.string(), z.unknown());
export const coachPatchSchema = z.object({
  professional: z
    .object({
      display_name: z.string().trim().min(2).max(120).optional(),
      headline: localized.optional(),
      bio: localized.optional(),
      experience_years: z.number().min(0).max(80).optional(),
      gender: z.enum(COACH_GENDERS).optional(),
      languages: z.array(z.string().max(40)).max(20).optional(),
      achievements: z.array(json).max(100).optional(),
    })
    .optional(),
  specialty_ids: z.array(objectId).max(50).optional(),
  service_modes: z
    .array(z.enum(COACH_SERVICE_MODES))
    .max(3)
    .optional(),
  services: z
    .array(
      z.object({
        id: z.string().max(80),
        title: localized,
        type: z.enum(COACH_SERVICE_TYPES),
        sport: z.string().max(80).optional(),
        duration_minutes: z.number().int().min(15).max(480).optional(),
        price: z.object({
          amount_minor: z.string().regex(/^\d+$/),
          currency: z.string().length(3).default("IRR"),
        }),
        status: z.enum(ACTIVE_INACTIVE_STATUSES).default("active"),
      }),
    )
    .max(100)
    .optional(),
  locations: z
    .array(
      z.object({
        branch_id: objectId.optional(),
        city: z.string().max(100).optional(),
        district: z.string().max(100).optional(),
        title: z.string().max(160).optional(),
        status: z.enum(ACTIVE_INACTIVE_STATUSES).default("active"),
      }),
    )
    .max(100)
    .optional(),
  availability_summary: json.optional(),
  custom_data: json.optional(),
});
export const coachSearchSchema = z.object({
  search: z.string().trim().max(100).optional(),
  specialty_id: objectId.optional(),
  service_mode: z.enum(COACH_SERVICE_MODES).optional(),
  gender: z.enum(COACH_GENDERS).optional(),
  city: z.string().trim().max(100).optional(),
  min_price: z.coerce.number().int().min(0).optional(),
  max_price: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export const coachVerificationSchema = z.object({
  status: z.enum(VERIFICATION_DECISIONS),
  reason: z.string().trim().max(1000).optional(),
});
export const coachOfferingSchema = z.object({
  branch_id: objectId,
  resource_id: objectId,
  profile: z.object({
    name: z.string().trim().min(2).max(160),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    description: z.record(z.string(), z.string()).optional(),
    sport: z.string().max(80).optional(),
    service_mode: z.enum(SERVICE_MODES).default("in_person"),
  }),
  pricing: z.object({
    base_amount: z.number().int().min(0),
    currency: z.string().length(3).default("IRR"),
  }),
  capacity: z
    .object({ maximum: z.number().int().min(1).max(1000).default(1) })
    .default({ maximum: 1 }),
  booking_settings: z.object({
    duration_minutes: z.number().int().min(15).max(480),
    booking_window_days: z.number().int().min(1).max(365).default(30),
    minimum_advance_minutes: z.number().int().min(0).default(60),
  }),
  coach_percentage_bps: z.number().int().min(0).max(10000).default(7000),
});
export const coachingRequestSchema = z.object({
  coach_profile_id: objectId,
  profile: z
    .object({
      goal: z.string().trim().max(500).optional(),
      sport: z.string().trim().max(100).optional(),
      note: z.string().trim().max(1000).optional(),
    })
    .default({}),
});
export const coachingStatusSchema = z.object({
  status: z.enum(COACHING_STATUS_UPDATES),
  reason: z.string().trim().max(1000).optional(),
});
export const coachingPatchSchema = z.object({
  coaching: z.object({
    coach_note: z.string().trim().max(3000).optional(),
    athlete_group: z.string().trim().max(100).optional(),
    next_review_at: z.coerce.date().optional(),
  }),
});
export const coachingMessageSchema = z.object({
  text: z.string().trim().min(1).max(4000),
});
