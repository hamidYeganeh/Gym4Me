export type DiscoveryCoachesDetailHeroSectionHeaderProps = {
  name: string;
  avatarSrc?: string;
  /**
   * ScrollY at which the hero has passed and the ProfileHeader-style morph begins.
   * Measured from the hero carousel height.
   */
  morphStartY?: number;
  isFavorite?: boolean;
  onBack?: () => void;
  onFavoriteChange?: (isFavorite: boolean) => void;
  onShare?: () => void;
};
