import type { Banner } from "../banners/banners.dto";
import type { ArticleKind, RefItem, Role, SportNode } from "../types";

export type DiscoverySectionKind =
  | "banners"
  | "club_categories"
  | "sport_categories"
  | "sports"
  | "clubs"
  | "articles";

export type DiscoverySourceStrategy =
  | "active"
  | "featured"
  | "top_rated"
  | "nearby"
  | "recommended_for_user"
  | "latest";

export type DiscoveryEmptyBehavior = "hide" | "show_empty" | "fallback";

export type DiscoverySectionDefinition = {
  id: string;
  kind: DiscoverySectionKind;
  content: {
    title: string;
    subtitle?: string;
    icon?: string;
    action?: { label?: string; link: string; variant?: string };
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

export type DiscoverySectionItem =
  Banner | RefItem | SportNode | DiscoveryClubCard | DiscoveryArticleCard;

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
