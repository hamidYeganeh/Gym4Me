import type { Banner } from "../banners/banners.dto";
import type { ArticleKind, RefItem, Role, SportNode } from "../types";

export type DiscoverySectionKind =
  | "banners"
  | "club_categories"
  | "sport_categories"
  | "sports"
  | "clubs"
  | "coaches"
  | "classes"
  | "spaces"
  | "slots"
  | "equipment"
  | "membership_plans"
  | "bookable_offers"
  | "amenities"
  | "articles";

export type DiscoverySourceStrategy =
  | "active"
  | "featured"
  | "top_rated"
  | "nearby"
  | "recommended_for_user"
  | "latest"
  | "verified"
  | "available"
  | "today"
  | "tomorrow"
  | "starting_soon"
  | "capacity_available"
  | "beginner_friendly"
  | "least_crowded"
  | "economical"
  | "unlimited"
  | "duration"
  | "sessions"
  | "entries";

export type DiscoveryEmptyBehavior = "hide" | "show_empty" | "fallback";

/** HeroUI Button variants for discovery section “see all” actions. */
export const DISCOVERY_ACTION_BUTTON_VARIANTS = [
  "primary",
  "secondary",
  "tertiary",
  "outline",
  "ghost",
  "danger",
] as const;

export type DiscoveryActionButtonVariant =
  (typeof DISCOVERY_ACTION_BUTTON_VARIANTS)[number];

export type DiscoverySectionAction = {
  label?: string;
  link: string;
  variant?: DiscoveryActionButtonVariant | string;
};

/** Maps stored / legacy action.variant values onto HeroUI Button variants. */
export function resolveDiscoveryActionButtonVariant(
  value?: string,
): DiscoveryActionButtonVariant {
  switch (value) {
    case "primary":
    case "secondary":
    case "tertiary":
    case "outline":
    case "ghost":
    case "danger":
      return value;
    case "button":
      return "primary";
    case "link":
    default:
      return "ghost";
  }
}

export type DiscoverySectionDefinition = {
  id: string;
  kind: DiscoverySectionKind;
  content: {
    title: string;
    subtitle?: string;
    icon?: string;
    action?: DiscoverySectionAction;
  };
  source: {
    strategy: DiscoverySourceStrategy;
    filters?: Record<string, unknown>;
    sort?: string;
    limit: number;
  };
  presentation: {
    component: string;
    layout: string;
    cardVariant?: string;
    rows?: number;
    background?: { tone?: string; pattern?: string };
  };
  targeting?: {
    authentication?: "all" | "guest" | "required";
    activeRoles?: Role[];
    sportIds?: string[];
    goalKeys?: string[];
    match?: "any" | "all";
  };
  emptyBehavior?: DiscoveryEmptyBehavior;
  fallback?: {
    strategy: DiscoverySourceStrategy;
    filters?: Record<string, unknown>;
    sort?: string;
  };
};

export type DiscoveryClubCard = {
  id: string;
  name: string;
  coverMediaId: string | null;
  galleryMediaId: string | null;
  address: string | null;
  rating: number;
  reviewCount: number;
  operationalStatus: string;
  sportIds: string[];
  amenityNames: string[];
  startingPriceAmount: number | null;
};

export type DiscoveryArticleCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  taxonomy: { category: string; kind: ArticleKind; audience: string };
  coverMediaId: string | null;
  publishedAt: string | null;
  createdAt: string;
  readingTimeMinutes: number;
  authorName: string;
};

export type DiscoverySpaceCard = {
  id: string;
  clubId: string;
  clubName: string;
  title: string;
  description: string | null;
  sportId: string | null;
  coverMediaId: string | null;
};

export type DiscoverySlotCard = {
  id: string;
  slotId: string;
  clubId: string;
  clubName: string;
  kind: "class" | "session" | "space";
  resourceId: string | null;
  title: string;
  coverMediaId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  remaining: number;
  price: number;
  currency: "IRT";
};

export type DiscoveryMembershipPlanCard = {
  id: string;
  clubId: string;
  clubName: string;
  name: string;
  description: string | null;
  kind: string;
  amount: number;
  currency: string;
  durationDays: number | null;
  sessionsTotal: number | null;
  entriesTotal: number | null;
};

export type DiscoverySectionItem =
  | Banner
  | RefItem
  | SportNode
  | DiscoveryClubCard
  | DiscoveryArticleCard
  | DiscoverySpaceCard
  | DiscoverySlotCard
  | DiscoveryMembershipPlanCard
  | import("./coaches.dto").DiscoveryCoach
  | import("./classes.dto").DiscoveryClass;

export type ResolvedDiscoverySection = DiscoverySectionDefinition & {
  items: DiscoverySectionItem[];
  totalCount?: number;
};

export type DiscoveryFeedQuery = {
  page_key?: string;
  page?: number;
  page_size?: number;
  feed_token?: string;
  lat?: number;
  lng?: number;
  locationId?: string;
};

export type DiscoveryFeedResponse = {
  meta: {
    page_key: string;
    schema_version: number;
    revision: number;
    feed_token: string;
    personalized: boolean;
    generated_at: string;
    cache_ttl_seconds: number;
  };
  pagination: {
    page: number;
    page_size: number;
    next: number | null;
    prev: number | null;
    has_more: boolean;
    count: number;
  };
  result: ResolvedDiscoverySection[];
};
