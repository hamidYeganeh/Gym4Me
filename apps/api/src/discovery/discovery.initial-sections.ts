import { Role } from '../common/enums';
import {
  DiscoveryAuthenticationTarget,
  DiscoveryEmptyBehavior,
  DiscoverySectionKind,
  DiscoverySourceStrategy,
} from './discovery.constants';
import type { DiscoverySectionDefinition } from './discovery.types';

/**
 * Editable starter draft for a new discovery home page. It is never merged
 * into an existing page, so an admin's saved ordering and removals win.
 */
export const INITIAL_DISCOVERY_HOME_SECTIONS: DiscoverySectionDefinition[] = [
  {
    id: 'discovery-home-banners',
    kind: DiscoverySectionKind.BANNERS,
    content: { title: 'پیشنهادهای ویژه' },
    source: {
      strategy: DiscoverySourceStrategy.ACTIVE,
      filters: { placement: 'discovery_home' },
      limit: 8,
    },
    presentation: { component: 'banner_carousel', layout: 'hero' },
    emptyBehavior: DiscoveryEmptyBehavior.HIDE,
  },
  {
    id: 'recommended-clubs',
    kind: DiscoverySectionKind.CLUBS,
    content: {
      title: 'پیشنهاد برای شما',
      subtitle: 'بر اساس ورزش‌ها و هدف‌های شما',
      action: { label: 'مشاهده همه', link: '/discovery/clubs' },
    },
    source: {
      strategy: DiscoverySourceStrategy.RECOMMENDED_FOR_USER,
      limit: 8,
    },
    presentation: {
      component: 'club_rail',
      layout: 'horizontal',
      cardVariant: 'compact',
    },
    targeting: {
      authentication: DiscoveryAuthenticationTarget.REQUIRED,
      activeRoles: [Role.ATHLETE],
    },
    emptyBehavior: DiscoveryEmptyBehavior.FALLBACK,
    fallback: { strategy: DiscoverySourceStrategy.TOP_RATED },
  },
  {
    id: 'featured-coaches',
    kind: DiscoverySectionKind.COACHES,
    content: {
      title: 'مربی‌های برتر',
      subtitle: 'مربی‌های تأییدشده و باتجربه',
      action: { label: 'مشاهده همه', link: '/discovery/coaches' },
    },
    source: { strategy: DiscoverySourceStrategy.TOP_RATED, limit: 8 },
    presentation: { component: 'coach_rail', layout: 'horizontal' },
    emptyBehavior: DiscoveryEmptyBehavior.HIDE,
  },
  {
    id: 'today-classes',
    kind: DiscoverySectionKind.CLASSES,
    content: {
      title: 'کلاس‌های امروز',
      subtitle: 'کلاس‌هایی که هنوز فرصت ثبت‌نام دارند',
      action: { label: 'مشاهده همه', link: '/discovery/classes' },
    },
    source: { strategy: DiscoverySourceStrategy.TODAY, limit: 8 },
    presentation: { component: 'class_rail', layout: 'horizontal' },
    emptyBehavior: DiscoveryEmptyBehavior.HIDE,
  },
  {
    id: 'featured-spaces',
    kind: DiscoverySectionKind.SPACES,
    content: {
      title: 'فضاها و زمین‌ها',
      subtitle: 'استخر، زمین و سالن‌های قابل رزرو',
      action: { label: 'مشاهده باشگاه‌ها', link: '/discovery/clubs' },
    },
    source: { strategy: DiscoverySourceStrategy.FEATURED, limit: 8 },
    presentation: { component: 'space_rail', layout: 'horizontal' },
    emptyBehavior: DiscoveryEmptyBehavior.HIDE,
  },
  {
    id: 'today-slots',
    kind: DiscoverySectionKind.SLOTS,
    content: {
      title: 'سانس‌های آزاد امروز',
      subtitle: 'سانس‌های باقی‌مانده با ظرفیت واقعی',
      action: { label: 'مشاهده باشگاه‌ها', link: '/discovery/clubs' },
    },
    source: { strategy: DiscoverySourceStrategy.TODAY, limit: 8 },
    presentation: { component: 'slot_rail', layout: 'horizontal' },
    emptyBehavior: DiscoveryEmptyBehavior.HIDE,
  },
  {
    id: 'popular-equipment',
    kind: DiscoverySectionKind.EQUIPMENT,
    content: {
      title: 'تجهیزات ورزشی',
      subtitle: 'باشگاه را بر اساس تجهیزات موردنیاز پیدا کنید',
      action: { label: 'مشاهده باشگاه‌ها', link: '/discovery/clubs' },
    },
    source: { strategy: DiscoverySourceStrategy.FEATURED, limit: 12 },
    presentation: { component: 'equipment_grid', layout: 'grid', rows: 2 },
    emptyBehavior: DiscoveryEmptyBehavior.HIDE,
  },
  {
    id: 'economic-membership-plans',
    kind: DiscoverySectionKind.MEMBERSHIP_PLANS,
    content: {
      title: 'پلن‌های عضویت اقتصادی',
      subtitle: 'عضویت‌های فعال و منتشرشده با قیمت مناسب‌تر',
      action: { label: 'مشاهده باشگاه‌ها', link: '/discovery/clubs' },
    },
    source: { strategy: DiscoverySourceStrategy.ECONOMICAL, limit: 8 },
    presentation: { component: 'membership_plan_rail', layout: 'horizontal' },
    emptyBehavior: DiscoveryEmptyBehavior.HIDE,
  },
  {
    id: 'bookable-now',
    kind: DiscoverySectionKind.BOOKABLE_OFFERS,
    content: {
      title: 'همین حالا قابل رزرو',
      subtitle: 'نزدیک‌ترین گزینه‌ها با ظرفیت باقی‌مانده',
      action: { label: 'مشاهده همه', link: '/discovery/clubs' },
    },
    source: { strategy: DiscoverySourceStrategy.AVAILABLE, limit: 8 },
    presentation: { component: 'bookable_offer_rail', layout: 'horizontal' },
    emptyBehavior: DiscoveryEmptyBehavior.HIDE,
  },
  {
    id: 'popular-amenities',
    kind: DiscoverySectionKind.AMENITIES,
    content: {
      title: 'امکانات رفاهی',
      subtitle: 'دوش، رختکن، پارکینگ، کمد، سونا و بیشتر',
      action: { label: 'مشاهده باشگاه‌ها', link: '/discovery/clubs' },
    },
    source: { strategy: DiscoverySourceStrategy.FEATURED, limit: 12 },
    presentation: { component: 'amenity_rail', layout: 'horizontal' },
    emptyBehavior: DiscoveryEmptyBehavior.HIDE,
  },
  {
    id: 'club-categories',
    kind: DiscoverySectionKind.CLUB_CATEGORIES,
    content: {
      title: 'نوع مجموعه',
      action: { label: 'مشاهده همه', link: '/discovery/clubs' },
    },
    source: { strategy: DiscoverySourceStrategy.FEATURED, limit: 12 },
    presentation: {
      component: 'club_category_grid',
      layout: 'grid',
      rows: 2,
    },
    emptyBehavior: DiscoveryEmptyBehavior.HIDE,
  },
  {
    id: 'sport-categories',
    kind: DiscoverySectionKind.SPORT_CATEGORIES,
    content: { title: 'دسته‌بندی ورزش‌ها' },
    source: { strategy: DiscoverySourceStrategy.FEATURED, limit: 8 },
    presentation: {
      component: 'sport_category_rail',
      layout: 'horizontal',
    },
    emptyBehavior: DiscoveryEmptyBehavior.HIDE,
  },
  {
    id: 'sports',
    kind: DiscoverySectionKind.SPORTS,
    content: { title: 'ورزش‌ها' },
    source: { strategy: DiscoverySourceStrategy.FEATURED, limit: 8 },
    presentation: { component: 'sport_rail', layout: 'horizontal' },
    emptyBehavior: DiscoveryEmptyBehavior.HIDE,
  },
  {
    id: 'latest-articles',
    kind: DiscoverySectionKind.ARTICLES,
    content: {
      title: 'خواندنی‌های تازه',
      action: { label: 'مشاهده همه', link: '/articles' },
    },
    source: { strategy: DiscoverySourceStrategy.LATEST, limit: 8 },
    presentation: { component: 'article_rail', layout: 'horizontal' },
    emptyBehavior: DiscoveryEmptyBehavior.HIDE,
  },
];
