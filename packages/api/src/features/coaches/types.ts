import type { ApiEntity, PaginationParams } from "../organizations/types";
export type { ApiEntity };
export interface CoachSearchParams extends PaginationParams {
  search?: string;
  specialty_id?: string;
  service_mode?: "in_person" | "online" | "group";
  gender?: "women" | "men" | "other" | "undisclosed";
  city?: string;
  min_price?: number;
  max_price?: number;
}
export interface CoachPatch {
  professional?: {
    display_name?: string;
    headline?: Record<string, string>;
    bio?: Record<string, string>;
    experience_years?: number;
    gender?: string;
    languages?: string[];
    achievements?: ApiEntity[];
  };
  specialty_ids?: string[];
  service_modes?: string[];
  services?: Array<{
    id: string;
    title: Record<string, string>;
    type: "private" | "group" | "online" | "program";
    sport?: string;
    duration_minutes?: number;
    price: { amount_minor: string; currency?: string };
    status?: "active" | "inactive";
  }>;
  locations?: ApiEntity[];
  availability_summary?: ApiEntity;
  custom_data?: ApiEntity;
}
export interface CoachOfferingInput {
  branch_id: string;
  resource_id: string;
  profile: {
    name: string;
    slug: string;
    description?: Record<string, string>;
    sport?: string;
    service_mode?: "in_person" | "online" | "hybrid";
  };
  pricing: { base_amount: number; currency?: string };
  capacity?: { maximum: number };
  booking_settings: {
    duration_minutes: number;
    booking_window_days?: number;
    minimum_advance_minutes?: number;
  };
  coach_percentage_bps?: number;
}
