import { z } from "zod";
import { GENDER_POLICIES, VERIFICATION_DECISIONS } from "../../../common/enums/index.js";
import {
  HOLIDAY_STATUSES,
  ORGANIZATION_STATUSES,
  ORGANIZATION_TYPES,
  STAFF_SCOPE_TYPES,
  WORKING_HOURS_STATUSES,
} from "../enums/index.js";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "شناسه معتبر نیست");
export const localized = z.record(z.string(), z.string());
export const jsonObject = z.record(z.string(), z.unknown());
export const slug = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const mobile = z.string().min(10).max(20);

const organizationProfileSchema = z.object({
  legal_name: z.string().trim().min(2).max(200),
  trade_name: z.string().trim().max(200).optional(),
  type: z.enum(ORGANIZATION_TYPES).optional(),
  registration_number: z.string().max(100).optional(),
  tax_id: z.string().max(100).optional(),
  description: localized.optional(),
  contact: jsonObject.optional(),
  address: jsonObject.optional(),
  logo: jsonObject.optional(),
});
const organizationSettingsSchema = z.object({
  locale: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().length(3).optional(),
  booking: jsonObject.optional(),
});
export const organizationCreateSchema = z.object({
  profile: organizationProfileSchema,
  settings: organizationSettingsSchema.optional(),
  custom_data: jsonObject.optional(),
});
export const organizationPatchSchema = z.object({
  profile: organizationProfileSchema.partial().optional(),
  settings: organizationSettingsSchema.partial().optional(),
  custom_data: jsonObject.optional(),
});

const clubProfileSchema = z.object({
  name: z.string().trim().min(2).max(200),
  slug,
  description: localized.optional(),
  logo: jsonObject.optional(),
  cover: jsonObject.optional(),
  contact: jsonObject.optional(),
  policies: jsonObject.optional(),
});
export const clubCreateSchema = z.object({
  organization_id: objectId,
  profile: clubProfileSchema,
  sports: z.array(jsonObject).default([]),
  amenities: z.array(jsonObject).default([]),
  custom_data: jsonObject.optional(),
});
export const clubPatchSchema = z.object({
  profile: clubProfileSchema.partial().optional(),
  sports: z.array(jsonObject).optional(),
  amenities: z.array(jsonObject).optional(),
  custom_data: jsonObject.optional(),
});

const period = z.object({
  opens_at: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  closes_at: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});
const branchProfileSchema = z.object({
  name: z.string().trim().min(2).max(200),
  slug,
  description: localized.optional(),
  gender_policy: z.enum(GENDER_POLICIES).optional(),
  contact: jsonObject.optional(),
  address: jsonObject.optional(),
  images: z.array(jsonObject).optional(),
});
const branchLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export const branchCreateSchema = z.object({
  profile: branchProfileSchema,
  location: branchLocationSchema,
  custom_data: jsonObject.optional(),
});
export const branchPatchSchema = z.object({
  profile: branchProfileSchema.partial().optional(),
  location: branchLocationSchema.optional(),
  custom_data: jsonObject.optional(),
});
export const workingHoursSchema = z.object({
  days: z
    .array(
      z.object({
        day_of_week: z.number().int().min(0).max(6),
        periods: z.array(period).max(4),
        status: z.enum(WORKING_HOURS_STATUSES).default("active"),
      }),
    )
    .max(7),
});
export const holidaySchema = z.object({
  date: z.coerce.date(),
  title: z.string().max(200).optional(),
  periods: z.array(period).max(4).default([]),
  status: z.enum(HOLIDAY_STATUSES).default("closed"),
});
export const invitationSchema = z.object({
  mobile,
  role_id: objectId,
  scope_type: z.enum(STAFF_SCOPE_TYPES),
  scope_id: objectId,
  employment: z
    .object({
      title: z.string().max(100).optional(),
      employee_code: z.string().max(100).optional(),
      branch_ids: z.array(objectId).optional(),
    })
    .optional(),
  expires_in_days: z.number().int().min(1).max(30).default(7),
});
export const statusUpdateSchema = z.object({
  status: z.enum(ORGANIZATION_STATUSES),
  reason: z.string().trim().min(2).max(1000).optional(),
});
export const verificationSchema = z.object({
  status: z.enum(VERIFICATION_DECISIONS),
  reason: z.string().trim().max(1000).optional(),
});
