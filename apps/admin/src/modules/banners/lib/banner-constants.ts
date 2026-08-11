import type {
  BannerLinkKind,
  BannerPlacement,
  PublishStatus,
} from "@repo/api";

export const BANNER_PLACEMENTS: BannerPlacement[] = [
  "discovery_home",
  "discovery_clubs",
  "discovery_coaches",
  "athlete_home",
  "coach_home",
  "owner_home",
];

export const BANNER_LINK_KINDS: BannerLinkKind[] = [
  "none",
  "internal",
  "external",
];

export const PUBLISH_STATUSES: PublishStatus[] = [
  "draft",
  "published",
  "unpublished",
];
