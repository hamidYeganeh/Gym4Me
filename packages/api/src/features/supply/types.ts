import type {
  ApiEntity,
  PaginatedResult,
  PaginationMeta,
  PaginationParams,
} from "../organizations/types";
export type { ApiEntity, PaginatedResult, PaginationMeta, PaginationParams };

export interface ResourceInput {
  type: string;
  profile: {
    name: string;
    slug: string;
    description?: Record<string, string>;
    sports?: string[];
    gender_policy?: "all" | "women" | "men" | "scheduled";
    amenities?: string[];
    equipment?: ApiEntity[];
    images?: ApiEntity[];
  };
  capacity: {
    mode?: "exclusive" | "shared";
    total: number;
    minimum_participants?: number;
    maximum_participants?: number;
  };
  booking_settings?: {
    slot_duration_minutes?: number;
    booking_window_days?: number;
    minimum_advance_minutes?: number;
    buffer_before_minutes?: number;
    buffer_after_minutes?: number;
    allow_recurring?: boolean;
    allow_group?: boolean;
  };
  custom_data?: ApiEntity;
  status?: "draft" | "active" | "maintenance";
}
export type ResourcePatch = Partial<
  Omit<ResourceInput, "profile" | "capacity" | "booking_settings">
> & {
  profile?: Partial<ResourceInput["profile"]>;
  capacity?: Partial<ResourceInput["capacity"]>;
  booking_settings?: Partial<NonNullable<ResourceInput["booking_settings"]>>;
};
export interface OfferingInput {
  branch_ids: string[];
  resource_requirements?: Array<{
    resource_id: string;
    quantity?: number;
    mode?: "required" | "optional";
  }>;
  provider?: { type?: "organization" | "coach"; coach_profile_id?: string; coach_user_id?: string };
  revenue_share?: { coach_percentage_bps?: number };
  profile: {
    name: string;
    slug: string;
    type:
      | "resource_rental"
      | "club_session"
      | "group_class"
      | "private_coaching"
      | "online_session"
      | "other";
    description?: Record<string, string>;
    sport?: string;
    service_mode?: "in_person" | "online" | "hybrid";
    images?: ApiEntity[];
  };
  pricing: {
    currency?: string;
    base_amount: number;
    pricing_mode?: "per_booking" | "per_person" | "per_hour";
    tax_included?: boolean;
  };
  capacity: { mode?: "exclusive" | "shared"; minimum?: number; maximum: number };
  booking_settings: {
    duration_minutes: number;
    booking_window_days?: number;
    minimum_advance_minutes?: number;
    cancellation_window_minutes?: number;
    allow_recurring?: boolean;
    allow_group?: boolean;
    allow_family?: boolean;
  };
  custom_data?: ApiEntity;
  status?: "draft" | "active";
}
export type OfferingPatch = Partial<
  Omit<OfferingInput, "profile" | "pricing" | "capacity" | "booking_settings">
> & {
  profile?: Partial<OfferingInput["profile"]>;
  pricing?: Partial<OfferingInput["pricing"]>;
  capacity?: Partial<OfferingInput["capacity"]>;
  booking_settings?: Partial<OfferingInput["booking_settings"]>;
};
export interface AvailabilityRuleInput {
  schedule: { day_of_week: number; periods: Array<{ starts_at: string; ends_at: string }> };
  validity?: { starts_on?: string; ends_on?: string };
  capacity?: { total?: number };
  priority?: number;
  status?: "active" | "inactive";
}
export interface AvailabilityExceptionInput {
  type: "closed" | "capacity_override" | "special_opening";
  period: { starts_at: string; ends_at: string };
  capacity?: { total?: number };
  reason?: string;
  status?: "active" | "inactive";
}
export interface SlotSearchParams {
  from: string;
  to: string;
  duration_minutes?: number;
  participants?: number;
  exclude_booking_id?: string;
}
export interface CatalogParams extends PaginationParams {
  type?: string;
  sport?: string;
  gender_policy?: string;
  search?: string;
}
export interface CatalogBranchParams extends PaginationParams {
  search?: string;
  sport?: string;
  city?: string;
  district?: string;
  gender_policy?: "all" | "women" | "men" | "scheduled";
  amenities?: string;
  min_rating?: number;
  min_price?: number;
  max_price?: number;
  open_now?: boolean;
  has_online_booking?: boolean;
  has_active_coach?: boolean;
  membership_available?: boolean;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
}
export interface AvailabilitySlot {
  startAt: string;
  endAt: string;
  localDate: string;
  startsAtLocal: string;
  endsAtLocal: string;
  capacity: { total: number; reserved: number; available: number };
  status: "available" | "full" | "closed";
  exceptionReason?: string;
}
export interface SlotSearchResult {
  resourceId: string;
  timeZone: string;
  from: string;
  to: string;
  slots: AvailabilitySlot[];
}
