import type { Role } from '../common/enums';
import type {
  DiscoveryAuthenticationTarget,
  DiscoveryEmptyBehavior,
  DiscoveryInterestMatch,
  DiscoverySectionKind,
  DiscoverySourceStrategy,
} from './discovery.constants';

export type DiscoveryActionButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'outline'
  | 'ghost'
  | 'danger';

export type DiscoveryAction = {
  label?: string;
  link: string;
  /** HeroUI Button variant; legacy `link` / `button` are normalized on the client. */
  variant?: DiscoveryActionButtonVariant | string;
};

export type DiscoverySectionDefinition = {
  id: string;
  kind: DiscoverySectionKind;
  content: {
    title: string;
    subtitle?: string;
    icon?: string;
    action?: DiscoveryAction;
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
    authentication?: DiscoveryAuthenticationTarget;
    activeRoles?: Role[];
    sportIds?: string[];
    goalKeys?: string[];
    match?: DiscoveryInterestMatch;
  };
  emptyBehavior?: DiscoveryEmptyBehavior;
  fallback?: {
    strategy: DiscoverySourceStrategy;
    filters?: Record<string, unknown>;
    sort?: string;
  };
};

export type DiscoveryPersonalizationContext = {
  authenticated: boolean;
  activeRole?: Role;
  sportIds: string[];
  goalKeys: string[];
  levelKey?: string;
};

export type DiscoveryFeedContext = {
  lat?: number;
  lng?: number;
  locationId?: string;
};

export type DiscoveryFeedSession = {
  pageKey: string;
  subject: string;
  revision: number;
  schemaVersion: number;
  sections: DiscoverySectionDefinition[];
  personalization: DiscoveryPersonalizationContext;
  context: DiscoveryFeedContext;
  createdAt: string;
};
