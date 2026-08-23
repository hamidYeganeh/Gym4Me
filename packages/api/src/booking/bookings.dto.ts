import type {
  BookingActor,
  BookingResourceType,
  BookingStatus,
  ConsultationKind,
} from "../types";

export type BookingUserRef = {
  id: string;
  name: { first: string | null; last: string | null };
  avatar: { mediaId: string | null };
  code: string | null;
  /** Provider audiences only. */
  phone?: string;
};

export type BookingClubRef = {
  id: string;
  name: string;
  address: string | null;
};

export type BookingIntake = {
  note: string | null;
  medicalConditionKeys: string[];
  supplementKeys: string[];
};

/** Price snapshot in Tomans. */
export type BookingPricing = {
  amount: number;
  discount: number;
  couponCode: string | null;
  total: number;
};

export type BookingPayment = {
  refId: string | null;
  paidAt: string | null;
};

export type BookingCancellation = {
  reasonKey: string | null;
  note: string | null;
  cancelledAt: string;
  cancelledBy: BookingActor;
};

/** What the booking reserves + display metadata for club resources. */
export type BookingResource = {
  type: BookingResourceType;
  refId: string;
  /** Class / space title for club bookings; null for coach bookings. */
  title: string | null;
  coverMediaId: string | null;
};

/** Resolved recurring occurrence for club bookings (session/class/space). */
export type BookingOccurrence = {
  date: string;
  startTime: string;
  endTime: string;
};

export type Booking = {
  id: string;
  code: string;
  status: BookingStatus;
  /** Provider-only creation context. */
  source?: "athlete" | "desk";
  holderType?: "member" | "guest";
  createdBy?: string;
  /** Unpaid-booking auto-cancel deadline (SYS-D13); null once paid/free. */
  paymentExpiresAt: string | null;
  /** Coach decision deadline for pending consultation requests. */
  approvalExpiresAt: string | null;
  resource: BookingResource;
  /** Coach bookings only. */
  consultationKind: ConsultationKind | null;
  /** Club bookings only. */
  occurrence: BookingOccurrence | null;
  recurringGroupId: string | null;
  attendeeCount: number;
  startsAt: string;
  endsAt: string;
  /** Present for the athlete audience (coach bookings). */
  coach?: BookingUserRef | null;
  /** Present for provider audiences (coach / club / admin). */
  athlete?: BookingUserRef | null;
  coachUserId: string | null;
  athleteId: string;
  slotId: string;
  club: BookingClubRef | null;
  intake: BookingIntake;
  pricing: BookingPricing;
  payment: BookingPayment | null;
  cancellation: BookingCancellation | null;
  createdAt: string;
  updatedAt: string;
};

export type BookingsListQuery = {
  page?: number;
  page_size?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: BookingStatus | BookingStatus[];
  bucket?: "upcoming" | "past" | "cancelled";
  from?: string;
  to?: string;
  resource_type?: BookingResourceType;
};

export type CreateBookingInput = {
  coachUserId: string;
  slotId: string;
  consultationKind: ConsultationKind;
  intake?: {
    note?: string;
    medicalConditionKeys?: string[];
    supplementKeys?: string[];
  };
  couponCode?: string;
  idempotencyKey: string;
};

export type CreateClubBookingInput = {
  clubId: string;
  /** ClubSlot (session / class / space) to reserve occurrences of. */
  slotId: string;
  /** One date = single booking; multiple = recurring series. */
  dates: string[];
  attendeeCount?: number;
  intake?: {
    note?: string;
    medicalConditionKeys?: string[];
    supplementKeys?: string[];
  };
  couponCode?: string;
  idempotencyKey: string;
};

export type CreateDeskClubBookingInput = Omit<
  CreateClubBookingInput,
  "clubId"
> & {
  holder:
    | { userId: string; memberPhone?: never; guest?: never }
    | { memberPhone: string; userId?: never; guest?: never }
    | {
        userId?: never;
        memberPhone?: never;
        guest: { name: string; phone: string };
      };
};

export type BookingCancellationPreview = {
  bookingId: string;
  paid: boolean;
  total: number;
  feePercent: number;
  feeAmount: number;
  refundAmount: number;
  currency: "IRT";
};

export type CreateClubBookingResult = {
  recurringGroupId: string | null;
  bookings: Booking[];
};

export type RescheduleBookingInput = {
  /** Coach bookings: target open CoachSlot. Club bookings: optional other ClubSlot. */
  slotId?: string;
  /** Club bookings: target occurrence date (YYYY-MM-DD). */
  date?: string;
};

export type CancelBookingSeriesInput = {
  /** Cancel occurrences on/after this date; default = today. */
  fromDate?: string;
  reasonKey?: string;
  note?: string;
};

export type CancelBookingSeriesResult = {
  cancelled: number;
  bookings: Booking[];
};

export type PayBookingResult = {
  bookingId: string;
  authority: string;
  redirectUrl: string;
};

export type VerifyBookingPaymentInput = {
  authority: string;
  status: "OK" | "NOK";
};

export type CancelBookingInput = {
  /** RefItem slug from `cancellation_reason`. */
  reasonKey?: string;
  note?: string;
};
