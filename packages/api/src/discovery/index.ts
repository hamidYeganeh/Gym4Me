export {
  createDiscoveryClubsApi,
  type DiscoveryClubsApi,
} from "./clubs.client";
export { discoveryClubsEndpoints } from "./clubs.endpoint";
export type {
  Club,
  ClubUserReview,
  CreateDiscoveryReviewInput,
  DiscoveryClubCategoryFacet,
  DiscoveryClubFacets,
  DiscoveryClubReviewsQuery,
  DiscoveryClubsQuery,
} from "./clubs.dto";
export { discoveryClubsKeys } from "./clubs.keys";

export {
  createDiscoveryClubSlotsApi,
  type DiscoveryClubSlotsApi,
} from "./club-slots.client";
export { discoveryClubSlotsEndpoints } from "./club-slots.endpoint";
export type {
  ClubCalendarDay,
  ClubCalendarOccurrence,
  ClubCalendarQuery,
  ClubCalendarResponse,
  ClubClass,
  ClubSlot,
  ClubSpace,
} from "./club-slots.dto";
export { discoveryClubSlotsKeys } from "./club-slots.keys";

export {
  createDiscoveryClassesApi,
  type DiscoveryClassesApi,
} from "./classes.client";
export { discoveryClassesEndpoints } from "./classes.endpoint";
export type {
  DiscoveryClass,
  DiscoveryClassClub,
  DiscoveryClassesQuery,
} from "./classes.dto";
export { discoveryClassesKeys } from "./classes.keys";

export {
  createDiscoveryCoachesApi,
  type DiscoveryCoachesApi,
} from "./coaches.client";
export { discoveryCoachesEndpoints } from "./coaches.endpoint";
export type {
  CoachConsultationPricing,
  DiscoveryCoach,
  DiscoveryCoachClub,
  DiscoveryCoachesQuery,
  DiscoveryCoachUser,
} from "./coaches.dto";
export { COACH_TYPES } from "../types";
export type { CoachType } from "../types";
export { discoveryCoachesKeys } from "./coaches.keys";

export { createDiscoveryFeedApi, type DiscoveryFeedApi } from "./feed.client";
export { discoveryFeedEndpoints } from "./feed.endpoint";
export {
  DISCOVERY_ACTION_BUTTON_VARIANTS,
  resolveDiscoveryActionButtonVariant,
} from "./feed.dto";
export type {
  DiscoveryActionButtonVariant,
  DiscoveryArticleCard,
  DiscoveryClubCard,
  DiscoveryEmptyBehavior,
  DiscoveryFeedQuery,
  DiscoveryFeedResponse,
  DiscoveryMembershipPlanCard,
  DiscoverySectionAction,
  DiscoverySectionDefinition,
  DiscoverySectionItem,
  DiscoverySectionKind,
  DiscoverySlotCard,
  DiscoverySpaceCard,
  DiscoverySourceStrategy,
  ResolvedDiscoverySection,
} from "./feed.dto";

export {
  createDiscoveryCoachSlotsApi,
  type DiscoveryCoachSlotsApi,
} from "./coach-slots.client";
export { discoveryCoachSlotsEndpoints } from "./coach-slots.endpoint";
export type {
  CoachSlot,
  CoachSlotClub,
  CoachSlotsRangeQuery,
  CoachSlotsResponse,
} from "./coach-slots.dto";
export { discoveryCoachSlotsKeys } from "./coach-slots.keys";
