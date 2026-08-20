export type DiscoveryClubsDetailHeroSectionHeaderProps = {
  title: string;
  isFavorite?: boolean;
  onBack?: () => void;
  onFavoriteChange?: (isFavorite: boolean) => void;
  onShare?: () => void;
};
