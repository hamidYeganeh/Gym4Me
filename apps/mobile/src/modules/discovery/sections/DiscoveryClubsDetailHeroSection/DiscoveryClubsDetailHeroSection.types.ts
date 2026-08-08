import type { ReactNode } from "react";

export type DiscoveryClubsDetailHeroSectionGalleryItem = {
  url: string;
  title?: string;
  description?: string;
};

export type DiscoveryClubsDetailHeroSectionProps = {
  title: string;
  location: string;
  /** Operating hours label shown under the location row. */
  openHoursLabel?: string;
  /** Whether the club is currently open. */
  isOpen?: boolean;
  /** Preferred gallery payload (url + optional caption). */
  gallery?: DiscoveryClubsDetailHeroSectionGalleryItem[];
  /** Fallback image URLs when `gallery` is omitted. */
  images?: string[];
  /** Average rating shown in the sheet header badge. */
  rating?: number;
  /** Review count shown under the rating badge. */
  reviewCount?: number;
  isFavorite?: boolean;
  children?: ReactNode;
};
