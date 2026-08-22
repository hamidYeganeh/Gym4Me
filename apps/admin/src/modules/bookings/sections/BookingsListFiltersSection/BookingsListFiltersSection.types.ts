import type {
  BookingResourceType,
  BookingStatus,
} from "@repo/api";

export type BookingBucketFilter = "all" | "upcoming" | "past" | "cancelled";

export type BookingsListFiltersSectionProps = {
  status: BookingStatus | "all";
  bucket: BookingBucketFilter;
  resourceType: BookingResourceType | "all";
  from: string;
  to: string;
  athleteId: string;
  coachUserId: string;
  clubId: string;
  onStatusChange: (value: BookingStatus | "all") => void;
  onBucketChange: (value: BookingBucketFilter) => void;
  onResourceTypeChange: (value: BookingResourceType | "all") => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onAthleteIdChange: (value: string) => void;
  onCoachUserIdChange: (value: string) => void;
  onClubIdChange: (value: string) => void;
  className?: string;
};

export const BOOKING_STATUSES: BookingStatus[] = [
  "pending",
  "awaiting_payment",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
  "no_show",
  "refund_requested",
  "refunded",
  "rejected",
];

export const BOOKING_BUCKETS: Exclude<BookingBucketFilter, "all">[] = [
  "upcoming",
  "past",
  "cancelled",
];

export const BOOKING_RESOURCE_TYPES: BookingResourceType[] = [
  "coach",
  "session",
  "class",
  "space",
];

export const CANCELLABLE: BookingStatus[] = [
  "pending",
  "awaiting_payment",
  "confirmed",
];

export const REFUNDABLE: BookingStatus[] = ["refund_requested", "cancelled"];
