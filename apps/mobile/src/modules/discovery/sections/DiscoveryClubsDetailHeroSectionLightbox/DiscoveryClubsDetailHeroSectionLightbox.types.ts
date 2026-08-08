export type DiscoveryClubsDetailHeroSectionLightboxItem = {
  url: string;
  title?: string;
  description?: string;
};

export type DiscoveryClubsDetailHeroSectionLightboxProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** Image URLs or captioned gallery items. */
  images: Array<string | DiscoveryClubsDetailHeroSectionLightboxItem>;
  activeIndex: number;
  onSelectImage: (index: number) => void;
  /** Center header title. Defaults to ClubDetail.galleryTitle. */
  title?: string;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
};
