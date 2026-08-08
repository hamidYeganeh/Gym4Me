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

export type ClubLifecycleStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "suspended";

/** Mirrors `UsersService.toPublic` nested response shape. */
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

export type PaginationMeta = {
  page: number;
  page_size: number;
  next: number | null;
  prev: number | null;
  total: number;
};

export type Paginated<T> = {
  pagination: PaginationMeta;
  result: T[];
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

export type ApiErrorBody = {
  statusCode?: number;
  message?: string | string[];
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

/** Admin choice option (includes inactive options + order). */
export type ChoiceOption = {
  name: string;
  value: string;
  order: number;
  isActive: boolean;
};

/** Mirrors `ChoicesService.toPublic` admin shape (`value` = group key). */
export type ChoiceGroup = {
  name: string;
  value: string;
  description: string | null;
  isSystem: boolean;
  options: ChoiceOption[];
  isActive: boolean;
};

export type GeoCoordinates = {
  lng: number;
  lat: number;
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
  ancestors: string[];
  coordinates: GeoCoordinates | null;
  coverMediaId: string | null;
  order: number;
  isActive: boolean;
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
  ancestors: string[];
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

/** Mirrors `NotificationReadStatus` in apps/api. */
export type NotificationReadStatus = "unread" | "read" | "archived";

/** Mirrors `DevicePlatform` in apps/api. */
export type DevicePlatform = "ios" | "android" | "web";

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
