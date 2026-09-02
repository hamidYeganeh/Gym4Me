export const CAMPAIGN_STATUSES = [
  "draft",
  "pending_review",
  "active",
  "paused",
  "rejected",
  "archived",
] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const AD_SURFACES = ["mobile", "business_panel", "public_web"] as const;
export type AdSurface = (typeof AD_SURFACES)[number];

export const PRICING_MODELS = ["cpm", "cpc", "cpa", "flat"] as const;
export type PricingModel = (typeof PRICING_MODELS)[number];

export const CREATIVE_TYPES = ["image", "text"] as const;
export type CreativeType = (typeof CREATIVE_TYPES)[number];

export const CAMPAIGN_OBJECTIVES = ["awareness", "traffic", "conversion"] as const;
export type CampaignObjective = (typeof CAMPAIGN_OBJECTIVES)[number];

export const AUDIENCE_ROLES = ["athlete", "coach"] as const;
export type AudienceRole = (typeof AUDIENCE_ROLES)[number];

export const CAMPAIGN_ACTIONS = ["submit", "pause", "resume", "archive"] as const;
export type CampaignAction = (typeof CAMPAIGN_ACTIONS)[number];

export const REVIEW_DECISIONS = ["approve", "reject"] as const;
export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];

export const METRIC_EVENT_TYPES = ["impression", "click", "conversion"] as const;
export type MetricEventType = (typeof METRIC_EVENT_TYPES)[number];
