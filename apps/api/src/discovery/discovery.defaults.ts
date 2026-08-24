import { Role } from '../common/enums';
import {
  DiscoveryAuthenticationTarget,
  DiscoveryEmptyBehavior,
  DiscoverySectionKind,
  DiscoverySourceStrategy,
} from './discovery.constants';
import type { DiscoverySectionDefinition } from './discovery.types';

export const DEFAULT_DISCOVERY_HOME_SECTIONS: DiscoverySectionDefinition[] = [
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
    id: 'nearby-clubs',
    kind: DiscoverySectionKind.CLUBS,
    content: {
      title: 'باشگاه‌های نزدیک شما',
      action: { label: 'مشاهده همه', link: '/discovery/clubs' },
    },
    source: {
      strategy: DiscoverySourceStrategy.NEARBY,
      filters: { radiusMeters: 10000 },
      limit: 8,
    },
    presentation: {
      component: 'club_rail',
      layout: 'horizontal',
      cardVariant: 'compact',
    },
    emptyBehavior: DiscoveryEmptyBehavior.HIDE,
  },
  {
    id: 'top-rated-clubs',
    kind: DiscoverySectionKind.CLUBS,
    content: {
      title: 'محبوب‌ترین باشگاه‌ها',
      action: { label: 'مشاهده همه', link: '/discovery/clubs' },
    },
    source: { strategy: DiscoverySourceStrategy.TOP_RATED, limit: 8 },
    presentation: {
      component: 'club_rail',
      layout: 'horizontal',
      cardVariant: 'compact',
    },
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
