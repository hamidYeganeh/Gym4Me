"use client";

import { useState } from "react";
import { OwnerWalkInBookingScreen } from "../screens/OwnerWalkInBookingScreen";
import type { OwnerWalkInBookingForm } from "../screens/OwnerWalkInBookingScreen/OwnerWalkInBookingScreen.types";
import {
  OWNER_WALK_IN_BOOKINGS,
  type OwnerWalkInBooking,
} from "./owner-walk-in-booking-data";

const RESOURCE_LABELS = {
  class: "کلاس عمومی",
  slot: "سانس آزاد",
  coach: "جلسه خصوصی",
} as const;

export function OwnerWalkInBookingGate() {
  const [bookings, setBookings] = useState(OWNER_WALK_IN_BOOKINGS);
  const [form, setForm] = useState<OwnerWalkInBookingForm>({
    memberOrGuest: "guest",
    name: "",
    phone: "",
    resourceType: "class",
    datetime: "",
    notes: "",
  });
  const [pending, setPending] = useState(false);

  const handleSubmit = () => {
    setPending(true);
    setTimeout(() => {
      const next: OwnerWalkInBooking = {
        id: `wb-${Date.now()}`,
        memberOrGuest: form.memberOrGuest,
        name: form.name.trim(),
        phone: form.phone.trim(),
        resourceType: form.resourceType,
        resourceLabel: RESOURCE_LABELS[form.resourceType],
        datetimeLabel: form.datetime.trim(),
        notes: form.notes.trim() || undefined,
        createdAtLabel: "همین الان",
      };
      setBookings((previous) => [next, ...previous]);
      setForm({
        memberOrGuest: "guest",
        name: "",
        phone: "",
        resourceType: "class",
        datetime: "",
        notes: "",
      });
      setPending(false);
    }, 400);
  };

  return (
    <OwnerWalkInBookingScreen
      bookings={bookings}
      form={form}
      onFormChange={(patch) => setForm((previous) => ({ ...previous, ...patch }))}
      onSubmit={handleSubmit}
      pending={pending}
    />
  );
}
