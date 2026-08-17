export type BaseProfileHeroSectionProps = {
  displayName: string;
  avatarSrc?: string | null;
  roleSegment: string;
  onSettingsPress: () => void;
  onAnalyticsPress: () => void;
  onEditPress: () => void;
  className?: string;
};
