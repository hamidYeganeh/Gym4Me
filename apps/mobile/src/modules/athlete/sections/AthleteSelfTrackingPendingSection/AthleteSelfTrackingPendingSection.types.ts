export type AthleteSelfTrackingPendingSectionProps = {
  count: number;
  pending?: boolean;
  onFlushPending?: () => void | Promise<void>;
  className?: string;
};
