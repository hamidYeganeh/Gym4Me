export type Gym4MeScoreCardProps = {
  className?: string;
  label: string;
  statusLabel: string;
  score: string;
  delta: string;
  previousLabel: string;
  thisMonthLabel: string;
  /** Restart chart draw animation when this changes. */
  animationKey?: string | number;
};
