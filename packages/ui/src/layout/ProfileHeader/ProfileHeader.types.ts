export type ProfileHeaderProps = {
  name?: string;
  /** Longer profile blurb under the name (expanded state). */
  bio?: string;
  /**
   * Short label under the name when `bio` is omitted.
   * Prefer `bio` for the expanded header layout.
   */
  role?: string;
  /**
   * Optional full-bleed cover photo behind the expanded header.
   * When omitted, the header uses a frosted gradient backdrop.
   */
  coverSrc?: string;
  avatarSrc?: string;
  avatarAlt?: string;
  hasNotification?: boolean;
  notificationLabel?: string;
  onNotificationPress?: () => void;
  className?: string;
};
