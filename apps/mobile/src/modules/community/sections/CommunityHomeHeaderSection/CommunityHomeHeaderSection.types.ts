export type CommunityHomeHeaderSectionProps = {
  firstName: string;
  avatarSrc?: string;
  isPro?: boolean;
  isSearchOpen?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onNotificationPress?: () => void;
  onSearchPress?: () => void;
  className?: string;
};
