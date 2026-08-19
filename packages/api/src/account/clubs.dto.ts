import type {
  ClubLifecycleStatus,
  GeoCoordinates,
} from "../types";

export type ClubOperationalStatus = "active" | "inactive";
export type GeoDirection = "north" | "south" | "east" | "west" | "center";
export type WeekdayStatus = "open" | "closed";
export type OperatingHourAudience = "shared" | "male" | "female";
export type RulePolicy = "allowed" | "forbidden";
export type ClubUserReviewStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "hidden";

export type ClubPhone = {
  number: string;
  label: string | null;
};

export type ClubGalleryItem = {
  mediaId: string;
  title: string | null;
  description: string | null;
  /** Cumulative view count (response); omit on write — server managed. */
  views?: number;
  /** ISO timestamp when added (response); omit on write — server managed. */
  createdAt?: string;
};

export type CancellationRule = {
  hoursBeforeReservation: number;
  feePercent: number;
  title: string;
  description?: string;
  color?: string;
};

/** Populated ref item (equipment / amenity / category); only `id` when the ref is missing. */
export type ClubRefItem = {
  id: string;
  type?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  coverMediaId?: string | null;
  order?: number;
  status?: string;
  isActive?: boolean;
};

/** Populated sport node; only `id` when the sport is missing. */
export type ClubSportItem = {
  id: string;
  kind?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  coverMediaId?: string | null;
  parentId?: string | null;
  ancestors?: string[];
  order?: number;
  isActive?: boolean;
};

export type ClubLocationNode = {
  id: string;
  kind: string;
  name: string;
  slug: string;
  flagSvg: string | null;
  parentId: string | null;
};

export type ClubCoachRef = {
  coachId: string;
  id?: string;
  name?: { first: string | null; last: string | null };
  avatar?: { mediaId: string | null };
};

export const CLUB_SOCIAL_PLATFORM_WEBSITE = "website";

export function clubWebsiteFromSocials(
  socials: { platform: string; url: string }[] | undefined,
): string | null {
  const url = socials
    ?.find((social) => social.platform === CLUB_SOCIAL_PLATFORM_WEBSITE)
    ?.url.trim();
  return url || null;
}

export function upsertClubWebsiteSocial(
  socials: { platform: string; url: string }[] | undefined,
  website: string | null | undefined,
): { platform: string; url: string }[] {
  const next = (socials ?? []).filter(
    (social) => social.platform !== CLUB_SOCIAL_PLATFORM_WEBSITE,
  );
  const url = website?.trim();
  if (url) {
    next.push({ platform: CLUB_SOCIAL_PLATFORM_WEBSITE, url });
  }
  return next;
}

export type Club = {
  id: string;
  ownerId: string;
  parentClubId: string | null;
  identity: {
    name: string;
    description: string | null;
    coverMediaId: string | null;
  };
  contact: {
    phones: ClubPhone[];
  };
  gallery: ClubGalleryItem[];
  cancellation: {
    rules: CancellationRule[];
    peakRules: CancellationRule[];
  };
  equipments: ClubRefItem[];
  amenities: ClubRefItem[];
  categories: ClubRefItem[];
  sports: ClubSportItem[];
  classes: { classId: string }[];
  coaches: ClubCoachRef[];
  location: {
    address: string;
    point: GeoCoordinates | null;
    direction: GeoDirection | null;
    locationId: string | null;
    ancestors: string[];
    node?: ClubLocationNode | null;
  } | null;
  audience: {
    genderPolicy: string | null;
    ageGroupKeys: string[];
    levelKeys: string[];
    accessibility: string;
  };
  reviewsSummary: {
    count: number;
    average: number;
    distribution: { star: number; count: number }[];
    criteria: { criterionId: string; average: number }[];
  };
  operatingHours: {
    weekday: number;
    status: WeekdayStatus;
    /** Defaults to `shared` when omitted (legacy rows). */
    audience?: OperatingHourAudience;
    open?: string;
    close?: string;
    description?: string;
  }[];
  socials: { platform: string; url: string }[];
  achievements: {
    achievementId: string;
    grantedAt: string;
    grantedBy: string | null;
  }[];
  rules: { policy: RulePolicy; title: string; description?: string }[];
  faq: { title: string; description: string }[];
  review: {
    status: ClubLifecycleStatus;
    submittedAt: string | null;
    reviewedAt: string | null;
    reviewNote: string | null;
    documentMediaIds: string[];
  };
  operationalStatus: ClubOperationalStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateClubInput = {
  identity: {
    name: string;
    description?: string;
    coverMediaId?: string | null;
  };
  contact?: {
    phones?: { number: string; label?: string }[];
  };
  gallery?: ClubGalleryItem[];
  cancellation?: {
    rules?: CancellationRule[];
    peakRules?: CancellationRule[];
  };
  equipmentIds?: string[];
  amenityIds?: string[];
  categoryIds?: string[];
  sportIds?: string[];
  classIds?: string[];
  coachIds?: string[];
  location?: {
    address: string;
    point?: GeoCoordinates;
    direction?: GeoDirection;
    locationId?: string;
  };
  parentClubId?: string;
  operatingHours?: Club["operatingHours"];
  socials?: Club["socials"];
  rules?: Club["rules"];
  faq?: Club["faq"];
  audience?: {
    genderPolicy?: string | null;
    ageGroupKeys?: string[];
    levelKeys?: string[];
    accessibility?: string;
  };
};

export type UpdateClubInput = Partial<Omit<CreateClubInput, "parentClubId">> & {
  location?: CreateClubInput["location"] | null;
};

export type AdminCreateClubInput = CreateClubInput & { ownerId: string };

export type SubmitClubReviewInput = {
  documentMediaIds: string[];
  note?: string;
};

export type ClubUserReview = {
  id: string;
  clubId: string;
  authorId: string;
  bookingId: string | null;
  rating: number;
  criteria: { criterionId: string; rating: number }[];
  comment: string | null;
  status: ClubUserReviewStatus;
  reply: {
    text: string;
    repliedAt: string;
    repliedBy: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type AccountClubsListQuery = Record<string, string | number | undefined>;

export type AccountClubReviewsQuery = Record<
  string,
  string | number | boolean | null | undefined
>;
