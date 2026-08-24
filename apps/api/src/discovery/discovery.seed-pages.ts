import type { DiscoverySectionDefinition } from './discovery.types';
import {
  DiscoveryEmptyBehavior,
  DiscoverySectionKind,
  DiscoverySourceStrategy,
} from './discovery.constants';
import { INITIAL_DISCOVERY_HOME_SECTIONS } from './discovery.initial-sections';

export const DISCOVERY_SEED_PAGE_KEYS = [
  'discovery_home',
  'discovery_clubs',
  'discovery_coaches',
  'discovery_sports',
  'discovery_articles',
  'discovery_classes',
] as const;

export type DiscoverySeedPageKey = (typeof DISCOVERY_SEED_PAGE_KEYS)[number];

export function appendMissingDiscoverySeedSections(
  existing: readonly DiscoverySectionDefinition[],
  seeded: readonly DiscoverySectionDefinition[],
) {
  const installedIds = new Set(existing.map((section) => section.id));
  return [
    ...existing,
    ...seeded.filter((section) => !installedIds.has(section.id)),
  ];
}

const COMPONENTS: Record<DiscoverySectionKind, string> = {
  [DiscoverySectionKind.BANNERS]: 'banner_carousel',
  [DiscoverySectionKind.CLUB_CATEGORIES]: 'club_category_grid',
  [DiscoverySectionKind.SPORT_CATEGORIES]: 'sport_category_rail',
  [DiscoverySectionKind.SPORTS]: 'sport_rail',
  [DiscoverySectionKind.CLUBS]: 'club_rail',
  [DiscoverySectionKind.COACHES]: 'coach_rail',
  [DiscoverySectionKind.CLASSES]: 'class_rail',
  [DiscoverySectionKind.SPACES]: 'space_rail',
  [DiscoverySectionKind.SLOTS]: 'slot_rail',
  [DiscoverySectionKind.EQUIPMENT]: 'equipment_grid',
  [DiscoverySectionKind.MEMBERSHIP_PLANS]: 'membership_plan_rail',
  [DiscoverySectionKind.BOOKABLE_OFFERS]: 'bookable_offer_rail',
  [DiscoverySectionKind.AMENITIES]: 'amenity_rail',
  [DiscoverySectionKind.ARTICLES]: 'article_rail',
};

function section(
  id: string,
  kind: DiscoverySectionKind,
  title: string,
  strategy: DiscoverySourceStrategy,
  options: {
    subtitle?: string;
    link?: string;
    limit?: number;
    filters?: Record<string, unknown>;
    layout?: string;
    rows?: number;
  } = {},
): DiscoverySectionDefinition {
  return {
    id,
    kind,
    content: {
      title,
      subtitle: options.subtitle,
      action: options.link
        ? { label: 'مشاهده همه', link: options.link }
        : undefined,
    },
    source: {
      strategy,
      filters: options.filters,
      limit: options.limit ?? 8,
    },
    presentation: {
      component: COMPONENTS[kind],
      layout:
        options.layout ??
        (kind === DiscoverySectionKind.BANNERS ? 'hero' : 'horizontal'),
      rows: options.rows,
    },
    emptyBehavior: DiscoveryEmptyBehavior.HIDE,
  };
}

const clubSections: DiscoverySectionDefinition[] = [
  section(
    'clubs-banners',
    DiscoverySectionKind.BANNERS,
    'پیشنهادهای باشگاه‌ها',
    DiscoverySourceStrategy.ACTIVE,
    { filters: { placement: 'discovery_clubs' } },
  ),
  section(
    'club-categories',
    DiscoverySectionKind.CLUB_CATEGORIES,
    'نوع مجموعه',
    DiscoverySourceStrategy.FEATURED,
    { link: '/discovery/clubs', limit: 12, layout: 'grid', rows: 2 },
  ),
  section(
    'top-rated-clubs',
    DiscoverySectionKind.CLUBS,
    'محبوب‌ترین باشگاه‌ها',
    DiscoverySourceStrategy.TOP_RATED,
    { link: '/discovery/clubs' },
  ),
  section(
    'nearby-clubs',
    DiscoverySectionKind.CLUBS,
    'باشگاه‌های نزدیک شما',
    DiscoverySourceStrategy.NEARBY,
    { link: '/discovery/clubs', filters: { radiusMeters: 10000 } },
  ),
  section(
    'club-spaces',
    DiscoverySectionKind.SPACES,
    'فضاها و زمین‌ها',
    DiscoverySourceStrategy.FEATURED,
    { link: '/discovery/clubs' },
  ),
  section(
    'club-slots-today',
    DiscoverySectionKind.SLOTS,
    'سانس‌های آزاد امروز',
    DiscoverySourceStrategy.TODAY,
    { link: '/discovery/clubs' },
  ),
  section(
    'club-equipment',
    DiscoverySectionKind.EQUIPMENT,
    'تجهیزات ورزشی',
    DiscoverySourceStrategy.FEATURED,
    { link: '/discovery/clubs', limit: 12, layout: 'grid', rows: 2 },
  ),
  section(
    'club-amenities',
    DiscoverySectionKind.AMENITIES,
    'امکانات رفاهی',
    DiscoverySourceStrategy.FEATURED,
    { link: '/discovery/clubs', limit: 12 },
  ),
  section(
    'club-membership-plans',
    DiscoverySectionKind.MEMBERSHIP_PLANS,
    'پلن‌های عضویت اقتصادی',
    DiscoverySourceStrategy.ECONOMICAL,
    { link: '/discovery/clubs' },
  ),
  section(
    'club-bookable-offers',
    DiscoverySectionKind.BOOKABLE_OFFERS,
    'همین حالا قابل رزرو',
    DiscoverySourceStrategy.AVAILABLE,
    { link: '/discovery/clubs' },
  ),
];

const coachSections: DiscoverySectionDefinition[] = [
  section(
    'coaches-banners',
    DiscoverySectionKind.BANNERS,
    'پیشنهادهای مربیگری',
    DiscoverySourceStrategy.ACTIVE,
    { filters: { placement: 'discovery_coaches' } },
  ),
  section(
    'top-coaches',
    DiscoverySectionKind.COACHES,
    'مربی‌های برتر',
    DiscoverySourceStrategy.TOP_RATED,
    { link: '/discovery/coaches' },
  ),
  section(
    'available-coaches',
    DiscoverySectionKind.COACHES,
    'مربی‌های دارای وقت آزاد',
    DiscoverySourceStrategy.AVAILABLE,
    { link: '/discovery/coaches' },
  ),
  section(
    'nearby-coaches',
    DiscoverySectionKind.COACHES,
    'مربی‌های نزدیک شما',
    DiscoverySourceStrategy.NEARBY,
    { link: '/discovery/coaches' },
  ),
  section(
    'recommended-coaches',
    DiscoverySectionKind.COACHES,
    'مناسب رشته‌های شما',
    DiscoverySourceStrategy.RECOMMENDED_FOR_USER,
    { link: '/discovery/coaches' },
  ),
  section(
    'verified-coaches',
    DiscoverySectionKind.COACHES,
    'مربی‌های تأییدشده',
    DiscoverySourceStrategy.VERIFIED,
    { link: '/discovery/coaches' },
  ),
];

const sportSections: DiscoverySectionDefinition[] = [
  section(
    'sport-categories',
    DiscoverySectionKind.SPORT_CATEGORIES,
    'دسته‌بندی ورزش‌ها',
    DiscoverySourceStrategy.FEATURED,
    { link: '/discovery/sports' },
  ),
  section(
    'sports',
    DiscoverySectionKind.SPORTS,
    'رشته‌های ورزشی',
    DiscoverySourceStrategy.FEATURED,
    { link: '/discovery/sports', limit: 12 },
  ),
  section(
    'sport-clubs',
    DiscoverySectionKind.CLUBS,
    'باشگاه‌های پیشنهادی',
    DiscoverySourceStrategy.RECOMMENDED_FOR_USER,
    { link: '/discovery/clubs' },
  ),
  section(
    'sport-coaches',
    DiscoverySectionKind.COACHES,
    'مربی‌های مناسب شما',
    DiscoverySourceStrategy.RECOMMENDED_FOR_USER,
    { link: '/discovery/coaches' },
  ),
  section(
    'sport-classes',
    DiscoverySectionKind.CLASSES,
    'کلاس‌های ورزشی',
    DiscoverySourceStrategy.LATEST,
    { link: '/discovery/classes' },
  ),
  section(
    'sport-spaces',
    DiscoverySectionKind.SPACES,
    'فضاهای ورزشی',
    DiscoverySourceStrategy.RECOMMENDED_FOR_USER,
    { link: '/discovery/clubs' },
  ),
];

const articleSections: DiscoverySectionDefinition[] = [
  section(
    'latest-articles',
    DiscoverySectionKind.ARTICLES,
    'خواندنی‌های تازه',
    DiscoverySourceStrategy.LATEST,
    { link: '/articles', limit: 12 },
  ),
];

const classSections: DiscoverySectionDefinition[] = [
  section(
    'classes-today',
    DiscoverySectionKind.CLASSES,
    'کلاس‌های امروز',
    DiscoverySourceStrategy.TODAY,
    { link: '/discovery/classes' },
  ),
  section(
    'classes-starting-soon',
    DiscoverySectionKind.CLASSES,
    'شروع نزدیک',
    DiscoverySourceStrategy.STARTING_SOON,
    { link: '/discovery/classes' },
  ),
  section(
    'classes-with-capacity',
    DiscoverySectionKind.CLASSES,
    'دارای ظرفیت باقی‌مانده',
    DiscoverySourceStrategy.CAPACITY_AVAILABLE,
    { link: '/discovery/classes' },
  ),
  section(
    'classes-for-beginners',
    DiscoverySectionKind.CLASSES,
    'مناسب مبتدی‌ها',
    DiscoverySourceStrategy.BEGINNER_FRIENDLY,
    { link: '/discovery/classes' },
  ),
  section(
    'class-bookable-offers',
    DiscoverySectionKind.BOOKABLE_OFFERS,
    'همین حالا قابل رزرو',
    DiscoverySourceStrategy.AVAILABLE,
    { link: '/discovery/classes', filters: { kind: 'class' } },
  ),
];

export const DISCOVERY_SEED_PAGES: Record<
  DiscoverySeedPageKey,
  DiscoverySectionDefinition[]
> = {
  discovery_home: INITIAL_DISCOVERY_HOME_SECTIONS,
  discovery_clubs: clubSections,
  discovery_coaches: coachSections,
  discovery_sports: sportSections,
  discovery_articles: articleSections,
  discovery_classes: classSections,
};
