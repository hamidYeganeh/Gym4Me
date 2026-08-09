import type { ReactNode } from "react";

export type ReservationCardStatusColor =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger";

export type ReservationCardProps = {
  /** Combined date + time label shown in the card header. */
  datetimeLabel: ReactNode;
  /** Coach / primary party display name. */
  coachName: ReactNode;
  /** Whether to show the verified seal next to the name. */
  isVerified?: boolean;
  /** Accessible label for the verified seal. */
  verifiedLabel?: string;
  /** Specialty / expertise label (e.g. "Cardio Expert"). */
  specialtyLabel?: ReactNode;
  /** Optional icon before the specialty label. */
  specialtyIcon?: ReactNode;
  /** Average rating value. */
  rating?: number;
  /** Total review count shown next to the rating. */
  ratingCount?: number;
  /** Session / booking title under the meta row. */
  sessionTitle: ReactNode;
  /** Optional status label chip. */
  statusLabel?: ReactNode;
  /** Theme color for the status chip. */
  statusColor?: ReservationCardStatusColor;
  /** Called when the main content row is pressed. */
  onPress?: () => void;
  /** Accessible label for the main pressable row. */
  "aria-label"?: string;
  /** Reschedule action. When omitted, the button is hidden. */
  onReschedule?: () => void;
  /** Cancel action. When omitted, the button is hidden. */
  onCancel?: () => void;
  /** Reschedule button label. */
  rescheduleLabel?: ReactNode;
  /** Cancel button label. */
  cancelLabel?: ReactNode;
  /** Extra classes for the root. */
  className?: string;
};
