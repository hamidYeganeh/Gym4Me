import { LANDING_ASSETS, LANDING_CLUBS } from "./landing-assets";

export const MARKETING_CTA = {
  primaryHref: "/for-clubs",
  secondaryHref: "/clubs",
  downloadHref: "#download",
} as const;

export const MARKETING_CASCADE_COUNT = 8;

/** Local mock assets — no remote Unsplash/CDN. */
export const MARKETING_HERO_CLUB_IMAGE = LANDING_CLUBS[0].image;
export const MARKETING_HERO_COACH_IMAGE = LANDING_ASSETS.coaches[0].src;

export const MARKETING_CLUB_IMAGES = LANDING_CLUBS.map(
  (club) => club.image,
) as unknown as readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

export const CLUB_CARD_WIDTH = 320;
export const CLUB_CARD_HEIGHT = 420;
export const COACH_CARD_WIDTH = 276;
export const COACH_CARD_HEIGHT = 367;

export const DISPLAY_FONT = '"Arial Black", Impact, sans-serif';
