export type DiscoveryClubsDetailHeroSectionHeaderProps = {
  isFavorite?: boolean;
  isSaved?: boolean;
  onBack?: () => void;
  onFavoriteChange?: (isFavorite: boolean) => void;
  onSavedChange?: (isSaved: boolean) => void;
};
