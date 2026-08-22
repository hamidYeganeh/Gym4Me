/** Mirrors `Role` in apps/api — keep in sync with product decisions. */
export type Role =
  | "athlete"
  | "coach"
  | "club_owner"
  | "club_staff"
  | "admin";

export type UserStatus = "active" | "blocked" | "deleted";

export type KycStatus = "none" | "pending" | "approved" | "rejected";

export type KycRequestKind = "identity" | "document";

export type KycRequestStatus = "pending" | "approved" | "rejected";

export type KycDocumentType =
  | "national_card"
  | "selfie"
  | "coach_certificate"
  | "business_license";

export type VerificationStatus =
  | "unsubmitted"
  | "pending"
  | "approved"
  | "rejected";

export type Privacy = "public" | "followers" | "coach_only" | "private";

/** Mirrors `AthleteBodyType` in apps/api. */
export type AthleteBodyType = "endomorph" | "ectomorph" | "mesomorph";

/** Mirrors `CoachType` in apps/api. A coach may have multiple. */
export const COACH_TYPES = [
  "bodybuilding",
  "strength-training",
  "weight-loss",
  "functional-training",
  "crossfit",
  "cardio-endurance",
  "general-fitness",
  "corrective-exercise",
  "sports-rehabilitation",
  "yoga",
  "pilates",
  "meditation-breathwork",
  "football-futsal",
  "volleyball",
  "basketball",
  "racket-sports",
  "swimming-aquatics",
  "boxing-kickboxing",
  "martial-arts",
  "running",
  "cycling",
  "outdoor-conditioning",
  "youth-fitness",
  "senior-fitness",
  "womens-fitness",
  "prenatal-postnatal",
  "adaptive-fitness",
  "contest-prep",
  "sports-nutrition",
] as const;

export type CoachType = (typeof COACH_TYPES)[number];

/** Mirrors `AthleteExperience` in apps/api. */
export type AthleteExperience = "beginner" | "experienced";

/** Mirrors `AthleteMood` in apps/api. */
export type AthleteMood =
  | "depressed"
  | "sad"
  | "neutral"
  | "happy"
  | "overjoyed";

/** Mirrors `AthleteDiet` in apps/api. */
export type AthleteDiet = "balanced" | "vegetarian" | "protein" | "gluten_free";

/** Mirrors `BloodGroup` in apps/api. */
export type BloodGroup = "A" | "B" | "AB" | "O";

/** Mirrors `RhFactor` in apps/api. */
export type RhFactor = "positive" | "negative";

export type ClubLifecycleStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "suspended";

/** Mirrors `FavouriteLocationKind` in apps/api. */
export type FavouriteLocationKind = "home" | "work" | "gym" | "other";

/** Mirrors `UsersService.toPublic` nested response shape. */
export type PublicAddress = {
  provinceId: string | null;
  city: string | null;
  street: string | null;
  apartment: string | null;
  postalCode: string | null;
  point: { lat: number; lng: number } | null;
};

export type FavouriteLocation = {
  id: string;
  kind: FavouriteLocationKind;
  label: string | null;
  address: PublicAddress;
};

export type PublicUser = {
  id: string;
  phone: string;
  name: {
    first: string | null;
    last: string | null;
  };
  avatar: {
    mediaId: string | null;
  };
  demographics: {
    gender: string | null;
    birthDate: string | null;
  };
  address: PublicAddress;
  favouriteLocations: FavouriteLocation[];
  nationalId: string | null;
  roles: Role[];
  code: string | null;
  referralCode: string | null;
  status: UserStatus;
  kyc: {
    status: KycStatus;
    verifiedAt: string | null;
  };
  phoneVerifiedAt: string | null;
  createdAt: string;
};

export type ApiErrorMessage = string | string[] | Record<string, string[]>;

/** Success or error payload message shapes. */
export type ApiMessage = ApiErrorMessage;

export type PaginationMeta = {
  page: number;
  page_size: number;
  next: number | null;
  prev: number | null;
  /** Total matching rows across all pages. */
  count: number;
  /**
   * @deprecated Prefer `count`. Kept for older clients during migration.
   */
  total?: number;
};

export type Paginated<T> = {
  message?: ApiMessage;
  pagination: PaginationMeta;
  result: T[];
};

export type SortOrder = "asc" | "desc";

/** Scalar or repeated/comma-joined value accepted by admin list filters. */
export type ListQueryFilter<T> = T | readonly T[];

export type ListQuery<TSortBy extends string = string> = {
  page?: number;
  page_size?: number;
  /** @deprecated Prefer `page_size`. */
  limit?: number;
  search?: string;
  sortBy?: TSortBy;
  sortOrder?: SortOrder;
};

/** @deprecated Prefer `Paginated<T>` — kept as alias during migration. */
export type ItemsResponse<T> = Paginated<T>;

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type AuthSession = TokenPair & {
  activeRole: Role;
  user: PublicUser;
  isNewUser?: boolean;
};

/** Resolve list total from `count` (preferred) or legacy `total`. */
export function paginationCount(meta: PaginationMeta): number {
  return meta.count ?? meta.total ?? 0;
}

export type ApiErrorBody = {
  statusCode?: number;
  message?: ApiErrorMessage;
  error?: string;
  /** Machine-readable error code, e.g. `KYC_REQUIRED`. */
  code?: string;
  /** Present on `KYC_REQUIRED` errors. */
  kycStatus?: KycStatus;
};

export type SuccessResponse = {
  success: true;
};

/** Mirrors `LocationKind` in apps/api. */
export type LocationKind = "country" | "province" | "city" | "district";

/** Mirrors `SportKind` in apps/api. */
export type SportKind = "category" | "sport" | "branch";

/** Mirrors `RefType` in apps/api. */
export type RefType =
  | "equipment"
  | "amenity"
  | "muscle"
  | "goal_type"
  | "coach_specialty"
  | "cancellation_reason"
  | "document_type"
  | "measurement_unit"
  | "club_category"
  | "review_criterion";

/** Mirrors `RefStatus` in apps/api. */
export type RefStatus = "approved" | "pending";

/** Public/admin choice option. Public omits `order`. */
export type ChoiceOption = {
  name: string;
  value: string;
  description?: string | null;
  isActive: boolean;
  order?: number;
};

/** Mirrors `ChoicesService.toPublic` (`value` = group key). */
export type ChoiceGroup = {
  name: string;
  value: string;
  description: string | null;
  isSystem: boolean;
  options: ChoiceOption[];
  isActive?: boolean;
};

export type GeoCoordinates = {
  lng: number;
  lat: number;
};

/** Populated location without nested parent/ancestors (used on those fields). */
export type LocationRef = {
  id: string;
  kind?: LocationKind;
  name?: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  /** Inline SVG markup for countries. */
  flagSvg?: string | null;
  parentId?: string | null;
  coordinates?: GeoCoordinates | null;
  coverMediaId?: string | null;
  order?: number;
  isActive?: boolean;
};

/** Mirrors `LocationService.toPublic`. */
export type LocationNode = {
  id: string;
  kind: LocationKind;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  /** Inline SVG markup for countries. */
  flagSvg: string | null;
  parentId: string | null;
  parent: LocationRef | null;
  ancestors: LocationRef[];
  coordinates: GeoCoordinates | null;
  coverMediaId: string | null;
  order: number;
  isActive: boolean;
};

/** Populated sport without nested parent/ancestors (used on those fields). */
export type SportRef = {
  id: string;
  kind?: SportKind;
  name?: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  coverMediaId?: string | null;
  parentId?: string | null;
  order?: number;
  isActive?: boolean;
};

/** Mirrors `SportService.toPublic`. */
export type SportNode = {
  id: string;
  kind: SportKind;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  coverMediaId: string | null;
  parentId: string | null;
  parent: SportRef | null;
  ancestors: SportRef[];
  order: number;
  isActive: boolean;
};

/** Mirrors `SupportTicketCategory` in apps/api. */
export type SupportTicketCategory =
  | "payment"
  | "booking"
  | "membership"
  | "technical"
  | "club_complaint"
  | "suggestion"
  | "complaint"
  | "other";

/** Mirrors `SupportTicketPriority` in apps/api. */
export type SupportTicketPriority = "low" | "normal" | "high" | "urgent";

/** Mirrors `SupportTicketStatus` in apps/api. */
export type SupportTicketStatus =
  | "open"
  | "awaiting_admin"
  | "awaiting_user"
  | "resolved"
  | "closed";

/** Mirrors `SupportMessageAuthorKind` in apps/api. */
export type SupportMessageAuthorKind = "requester" | "admin";

/** Mirrors `SupportRelatedEntityKind` in apps/api. */
export type SupportRelatedEntityKind =
  | "booking"
  | "payment"
  | "club"
  | "membership";

/** Mirrors `FaqAudience` in apps/api. */
export type FaqAudience = "all" | "athlete" | "coach" | "club_owner";

/** Mirrors `PublishStatus` in apps/api. */
export type PublishStatus = "draft" | "published" | "unpublished";

/** Mirrors `BannerPlacement` in apps/api. */
export type BannerPlacement =
  | "discovery_home"
  | "discovery_clubs"
  | "discovery_coaches"
  | "athlete_home"
  | "coach_home"
  | "owner_home";

/** Mirrors `BannerLinkKind` in apps/api. */
export type BannerLinkKind = "none" | "internal" | "external";

/** Mirrors `BannerOverlayPlacement` in apps/api. */
export type BannerOverlayPlacement =
  | "top-start"
  | "top-center"
  | "top-end"
  | "center-start"
  | "center"
  | "center-end"
  | "bottom-start"
  | "bottom-center"
  | "bottom-end";

/** Mirrors `BannerAspectRatio` in apps/api. */
export type BannerAspectRatio = "16/9" | "2/1" | "4/3" | "1/1";

/** Mirrors `BannerRadius` in apps/api. */
export type BannerRadius =
  | "none"
  | "sm"
  | "field"
  | "compact"
  | "auth"
  | "surface"
  | "full";

/** Mirrors `ArticleKind` in apps/api. */
export type ArticleKind = "guide" | "news" | "tip" | "story" | "workout";

/** Mirrors `ArticleAudience` in apps/api. */
export type ArticleAudience = "all" | "athlete" | "coach" | "club_owner";

/** Mirrors `NotificationReadStatus` in apps/api. */
export type NotificationReadStatus = "unread" | "read" | "archived";

/** Mirrors `DevicePlatform` in apps/api. */
export type DevicePlatform = "ios" | "android" | "web";

/** Mirrors `BookingStatus` in apps/api (locked product decision). */
export type BookingStatus =
  | "pending"
  | "awaiting_payment"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "no_show"
  | "refund_requested"
  | "refunded"
  | "rejected";

/** Mirrors `ConsultationKind` in apps/api. */
export type ConsultationKind = "in_person" | "remote";

/** Mirrors `CoachSlotStatus` in apps/api. */
export type CoachSlotStatus = "open" | "booked" | "blocked";

/** Mirrors `BookingActor` in apps/api. */
export type BookingActor = "athlete" | "coach" | "club" | "admin";

/** Mirrors `BookingResourceType` in apps/api (locked product decision). */
export type BookingResourceType = "coach" | "session" | "class" | "space";

/** Mirrors `RefService.toPublic`. */
export type RefItem = {
  id: string;
  type: RefType;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  coverMediaId: string | null;
  order: number;
  status: RefStatus;
  isActive: boolean;
};
