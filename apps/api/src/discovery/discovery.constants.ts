export enum DiscoverySectionKind {
  BANNERS = 'banners',
  CLUB_CATEGORIES = 'club_categories',
  SPORT_CATEGORIES = 'sport_categories',
  SPORTS = 'sports',
  CLUBS = 'clubs',
  ARTICLES = 'articles',
}

export enum DiscoverySourceStrategy {
  ACTIVE = 'active',
  FEATURED = 'featured',
  TOP_RATED = 'top_rated',
  NEARBY = 'nearby',
  RECOMMENDED_FOR_USER = 'recommended_for_user',
  LATEST = 'latest',
}

export enum DiscoveryAuthenticationTarget {
  ALL = 'all',
  GUEST = 'guest',
  REQUIRED = 'required',
}

export enum DiscoveryInterestMatch {
  ANY = 'any',
  ALL = 'all',
}

export enum DiscoveryEmptyBehavior {
  HIDE = 'hide',
  SHOW_EMPTY = 'show_empty',
  FALLBACK = 'fallback',
}

export const DISCOVERY_SCHEMA_VERSION = 1;
export const DISCOVERY_DEFAULT_PAGE_SIZE = 8;
export const DISCOVERY_MAX_PAGE_SIZE = 8;
export const DISCOVERY_MAX_SECTIONS = 64;
export const DISCOVERY_MAX_ITEMS_PER_SECTION = 12;
export const DISCOVERY_FEED_TTL_SECONDS = 30 * 60;
