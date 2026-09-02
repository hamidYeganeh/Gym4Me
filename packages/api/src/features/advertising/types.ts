import type { ApiEntity, PaginationParams } from "../organizations/types";
export type { ApiEntity };

export type AdStatus = "draft" | "pending_review" | "active" | "paused" | "rejected" | "archived";
export interface AdListParams extends PaginationParams {
  status?: AdStatus;
}
export interface AdPlacementInput {
  code: string;
  profile: {
    title: string;
    description?: string;
    surface: "mobile" | "business_panel" | "public_web";
    dimensions?: { width: number; height: number };
  };
  pricing: { model: "cpm" | "cpc" | "cpa" | "flat"; amount_minor: number; currency: string };
  rules?: { allowed_creative_types: Array<"image" | "text"> };
  status?: "active" | "inactive" | "archived";
}
export interface AdCampaignInput {
  profile: { name: string; objective: "awareness" | "traffic" | "conversion" };
  placement_ids: string[];
  targeting: {
    cities: string[];
    sport_ids: string[];
    branch_ids: string[];
    audience_roles: Array<"athlete" | "coach">;
  };
  budget: { total_minor: number; daily_minor: number; currency: string };
  schedule: { starts_at: string | Date; ends_at: string | Date };
  creatives: Array<{
    id: string;
    type: "image" | "text";
    title: string;
    body?: string;
    image_url?: string;
    destination_url: string;
    alt_text?: string;
  }>;
  custom_data?: ApiEntity;
}
export interface RenderedAd {
  campaign_id: string;
  placement: { code: string; profile: ApiEntity };
  creative: ApiEntity;
  tracking: { token: string; placement_code: string };
}
