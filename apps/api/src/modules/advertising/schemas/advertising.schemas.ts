import { z } from "zod";
import { RECORD_STATUSES } from "../../../common/enums/index.js";
import {
  AD_SURFACES,
  AUDIENCE_ROLES,
  CAMPAIGN_ACTIONS,
  CAMPAIGN_OBJECTIVES,
  CAMPAIGN_STATUSES,
  CREATIVE_TYPES,
  METRIC_EVENT_TYPES,
  PRICING_MODELS,
  REVIEW_DECISIONS,
} from "../enums/index.js";

export const objectId = z.string().regex(/^[0-9a-f]{24}$/i, "شناسه نامعتبر است.");
export const pageSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(CAMPAIGN_STATUSES).optional(),
});

export const placementSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9._-]+$/),
  profile: z.object({
    title: z.string().trim().min(2).max(120),
    description: z.string().trim().max(500).optional(),
    surface: z.enum(AD_SURFACES),
    dimensions: z
      .object({ width: z.number().int().positive(), height: z.number().int().positive() })
      .optional(),
  }),
  pricing: z.object({
    model: z.enum(PRICING_MODELS),
    amount_minor: z.number().int().min(0),
    currency: z.string().trim().length(3).default("IRR"),
  }),
  rules: z
    .object({
      allowed_creative_types: z
        .array(z.enum(CREATIVE_TYPES))
        .min(1)
        .default(["image"]),
    })
    .default({ allowed_creative_types: ["image"] }),
  status: z.enum(RECORD_STATUSES).default("active"),
});

const creativeSchema = z.object({
  id: z.string().trim().min(1).max(80),
  type: z.enum(CREATIVE_TYPES).default("image"),
  title: z.string().trim().min(2).max(100),
  body: z.string().trim().max(300).optional(),
  image_url: z.string().url().optional(),
  destination_url: z.string().url(),
  alt_text: z.string().trim().max(160).optional(),
});

const campaignBaseSchema = z.object({
  profile: z.object({
    name: z.string().trim().min(2).max(120),
    objective: z.enum(CAMPAIGN_OBJECTIVES),
  }),
  placement_ids: z.array(objectId).min(1).max(10),
  targeting: z.object({
    cities: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
    sport_ids: z.array(objectId).max(30).default([]),
    branch_ids: z.array(objectId).max(100).default([]),
    audience_roles: z
      .array(z.enum(AUDIENCE_ROLES))
      .max(2)
      .default(["athlete"]),
  }),
  budget: z.object({
    total_minor: z.number().int().positive(),
    daily_minor: z.number().int().positive(),
    currency: z.string().trim().length(3).default("IRR"),
  }),
  schedule: z.object({ starts_at: z.coerce.date(), ends_at: z.coerce.date() }),
  creatives: z.array(creativeSchema).min(1).max(5),
  custom_data: z.record(z.string(), z.unknown()).default({}),
});

const validateCampaign = (value: z.infer<typeof campaignBaseSchema>, ctx: z.RefinementCtx) => {
  if (value.schedule.ends_at <= value.schedule.starts_at)
    ctx.addIssue({
      code: "custom",
      path: ["schedule", "ends_at"],
      message: "پایان کمپین باید بعد از شروع آن باشد.",
    });
  if (value.budget.daily_minor > value.budget.total_minor)
    ctx.addIssue({
      code: "custom",
      path: ["budget", "daily_minor"],
      message: "بودجه روزانه نمی‌تواند بیشتر از بودجه کل باشد.",
    });
};

export const campaignCreateSchema = campaignBaseSchema.superRefine(validateCampaign);

export const campaignPatchSchema = campaignBaseSchema.partial().superRefine((value, ctx) => {
  if (value.schedule && value.schedule.ends_at <= value.schedule.starts_at)
    ctx.addIssue({
      code: "custom",
      path: ["schedule", "ends_at"],
      message: "پایان کمپین باید بعد از شروع آن باشد.",
    });
  if (value.budget && value.budget.daily_minor > value.budget.total_minor)
    ctx.addIssue({
      code: "custom",
      path: ["budget", "daily_minor"],
      message: "بودجه روزانه نمی‌تواند بیشتر از بودجه کل باشد.",
    });
});
export const campaignActionSchema = z.object({
  action: z.enum(CAMPAIGN_ACTIONS),
});
export const campaignReviewSchema = z.object({
  decision: z.enum(REVIEW_DECISIONS),
  note: z.string().trim().min(2).max(1000),
});
export const catalogAdQuerySchema = z.object({
  city: z.string().trim().max(80).optional(),
  sport_id: objectId.optional(),
  branch_id: objectId.optional(),
  audience_role: z.enum(AUDIENCE_ROLES).default("athlete"),
});
export const metricEventSchema = z.object({
  tracking_token: z.string().min(40).max(2000),
  type: z.enum(METRIC_EVENT_TYPES),
  context: z.object({ session_id: z.string().trim().max(160).optional() }).passthrough(),
});
