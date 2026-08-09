export type DiscoveryClubsDetailHeroSectionLightboxItem = {
  url: string;
  title?: string;
  description?: string;
};

export type DiscoveryClubsDetailHeroSectionLightboxLabels = {
  close: string;
  favorite: string;
  prev: string;
  next: string;
  selectImage: (index: number) => string;
  /** Fallback when `title` prop is omitted. */
  title?: string;
};

export type DiscoveryClubsDetailHeroSectionLightboxProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** Image URLs or captioned gallery items. */
  images: Array<string | DiscoveryClubsDetailHeroSectionLightboxItem>;
  activeIndex: number;
  onSelectImage: (index: number) => void;
  /** Center header title. Defaults to ClubDetail.galleryTitle / labels.title. */
  title?: string;
  /**
   * Optional chrome labels. When omitted, falls back to ClubDetail
   * translations so existing club hero usage stays unchanged.
   */
  labels?: DiscoveryClubsDetailHeroSectionLightboxLabels;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
};
