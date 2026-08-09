import type { GalleryMediaItem } from "../../lib/gallery-media";

export type DiscoveryGallerySectionLabels = {
  title: string;
  seeAll: string;
  action: string;
  newBadge: string;
  close: string;
  favorite: string;
  prev: string;
  next: string;
  selectImage: (index: number) => string;
};

export type DiscoveryGallerySectionProps = {
  gallery: GalleryMediaItem[];
  labels: DiscoveryGallerySectionLabels;
  className?: string;
};
