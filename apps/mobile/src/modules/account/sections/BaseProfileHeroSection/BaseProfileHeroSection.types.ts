export type BaseProfileHeroSectionProps = {
  displayName: string;
  avatarSrc?: string | null;
  roleSegment: string;
  onSettingsPress: () => void;
  onThemePress: () => void;
  onEditPress: () => void;
  className?: string;
};
