import type {
  OwnerWalkInBooking,
  OwnerWalkInMemberType,
  OwnerWalkInResourceType,
} from "../../lib/owner-walk-in-booking-data";

export type OwnerWalkInBookingForm = {
  memberOrGuest: OwnerWalkInMemberType;
  name: string;
  phone: string;
  resourceType: OwnerWalkInResourceType;
  datetime: string;
  notes: string;
};

export type OwnerWalkInBookingScreenProps = {
  bookings: OwnerWalkInBooking[];
  form: OwnerWalkInBookingForm;
  pending?: boolean;
  onFormChange: (patch: Partial<OwnerWalkInBookingForm>) => void;
  onSubmit?: () => void;
  className?: string;
};
