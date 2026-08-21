import type {
  BannerAspectRatio,
  BannerLinkKind,
  BannerOverlayPlacement,
  BannerPlacement,
  BannerRadius,
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

export const BANNER_OVERLAY_PLACEMENTS: BannerOverlayPlacement[] = [
  "top-start",
  "top-center",
  "top-end",
  "center-start",
  "center",
  "center-end",
  "bottom-start",
  "bottom-center",
  "bottom-end",
];

export const BANNER_ASPECT_RATIOS: BannerAspectRatio[] = [
  "16/9",
  "2/1",
  "4/3",
  "1/1",
];

export const BANNER_RADII: BannerRadius[] = [
  "none",
  "sm",
  "field",
  "compact",
  "auth",
  "surface",
  "full",
];

export const PUBLISH_STATUSES: PublishStatus[] = [
  "draft",
  "published",
  "unpublished",
];
