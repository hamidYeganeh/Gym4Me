export type ProfileStat = {
  key: string;
  label: string;
  value: string;
  /** Overlapping mini-avatars shown in the trailing corner of the card. */
  avatars?: string[];
  /** When set, shows a circular arrow action in the trailing corner. */
  onActionPress?: () => void;
  actionLabel?: string;
};

export type ProfileStatsProps = {
  stats: ProfileStat[];
  className?: string;
};
