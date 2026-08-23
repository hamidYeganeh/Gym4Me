"use client";

import { useEffect, useState } from "react";
import {
  clubBookings,
  clubOwnerClubs,
  discoveryClubSlots,
} from "@/shared/lib/api";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { OwnerWalkInBookingScreen } from "../screens/OwnerWalkInBookingScreen";
import type { OwnerWalkInBookingForm } from "../screens/OwnerWalkInBookingScreen/OwnerWalkInBookingScreen.types";
import {
  OWNER_WALK_IN_BOOKINGS,
  type OwnerWalkInBooking,
  type OwnerWalkInOccurrenceOption,
  type OwnerWalkInResourceType,
} from "./owner-walk-in-booking-data";

const RESOURCE_LABELS: Record<OwnerWalkInResourceType, string> = {
  class: "کلاس عمومی",
  slot: "سانس آزاد",
  space: "فضای ورزشی",
  coach: "جلسه خصوصی",
};

const INITIAL_FORM: OwnerWalkInBookingForm = {
  memberOrGuest: "guest",
  name: "",
  phone: "",
  resourceType: "class",
  datetime: "",
  notes: "",
};

function newDeskRequestKey() {
  return `walkin-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
}

function dateInTehran(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function OwnerWalkInBookingGate() {
  const [bookings, setBookings] = useState<OwnerWalkInBooking[]>(
    DEMO_MODE ? OWNER_WALK_IN_BOOKINGS : [],
  );
  const [form, setForm] = useState<OwnerWalkInBookingForm>(INITIAL_FORM);
  const [clubId, setClubId] = useState<string | null>(null);
  const [occurrences, setOccurrences] = useState<OwnerWalkInOccurrenceOption[]>(
    [],
  );
  const [pending, setPending] = useState(false);
  const [requestKey, setRequestKey] = useState(newDeskRequestKey);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (DEMO_MODE) return;
    let active = true;
    void (async () => {
      try {
        const clubs = await clubOwnerClubs.list({ page: 1, page_size: 1 });
        const club = clubs.result[0];
        if (!club || !active) {
          setError("برای ثبت رزرو، ابتدا یک باشگاه فعال لازم است.");
          return;
        }
        setClubId(club.id);
        const [calendar, recent] = await Promise.all([
          discoveryClubSlots.getCalendar(club.id, {
            from: dateInTehran(new Date()),
            to: dateInTehran(new Date(Date.now() + 14 * 86_400_000)),
          }),
          clubBookings.list(club.id, { page: 1, page_size: 20 }),
        ]);
        if (!active) return;
        setOccurrences(
          calendar.days.flatMap((day) =>
            day.items
              .filter((item) => item.remaining > 0)
              .map((item) => ({
                value: `${item.slotId}|${day.date}`,
                label: `${item.class?.title ?? item.space?.title ?? RESOURCE_LABELS[item.kind === "session" ? "slot" : item.kind]} · ${day.date} · ${item.startTime}–${item.endTime} · ${item.remaining} ظرفیت`,
                resourceType: item.kind === "session" ? "slot" : item.kind,
              })),
          ),
        );
        setBookings(
          recent.result.map((booking) => ({
            id: booking.id,
            memberOrGuest: booking.holderType ?? "member",
            name:
              [booking.athlete?.name.first, booking.athlete?.name.last]
                .filter(Boolean)
                .join(" ") || "عضو باشگاه",
            phone: booking.athlete?.phone ?? "—",
            resourceType:
              booking.resource.type === "session"
                ? "slot"
                : booking.resource.type === "space"
                  ? "space"
                  : booking.resource.type === "class"
                    ? "class"
                    : "coach",
            resourceLabel: booking.resource.title ?? RESOURCE_LABELS.slot,
            datetimeLabel: booking.occurrence
              ? `${booking.occurrence.date} · ${booking.occurrence.startTime}`
              : booking.startsAt,
            notes: booking.intake.note ?? undefined,
            createdAtLabel: booking.createdAt,
          })),
        );
      } catch (cause) {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "دریافت اطلاعات رزرو ممکن نشد.",
          );
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async () => {
    if (DEMO_MODE) {
      setBookings((previous) => [
        {
          id: `wb-${Date.now()}`,
          memberOrGuest: form.memberOrGuest,
          name: form.name.trim(),
          phone: form.phone.trim(),
          resourceType: form.resourceType,
          resourceLabel: RESOURCE_LABELS[form.resourceType],
          datetimeLabel: form.datetime.trim(),
          notes: form.notes.trim() || undefined,
          createdAtLabel: "همین الان",
        },
        ...previous,
      ]);
      setForm(INITIAL_FORM);
      return;
    }

    const [slotId, date] = form.datetime.split("|");
    if (!clubId || !slotId || !date) return;
    setPending(true);
    setError(undefined);
    try {
      const result = await clubBookings.createDesk(clubId, {
        holder:
          form.memberOrGuest === "member"
            ? { memberPhone: form.phone.trim() }
            : {
                guest: { name: form.name.trim(), phone: form.phone.trim() },
              },
        slotId,
        dates: [date],
        intake: { note: form.notes.trim() || undefined },
        idempotencyKey: requestKey,
      });
      const created = result.bookings[0];
      if (created) {
        setBookings((previous) => [
          {
            id: created.id,
            memberOrGuest: form.memberOrGuest,
            name:
              [created.athlete?.name.first, created.athlete?.name.last]
                .filter(Boolean)
                .join(" ") ||
              form.name.trim() ||
              "عضو باشگاه",
            phone: form.phone.trim(),
            resourceType: form.resourceType,
            resourceLabel:
              created.resource.title ?? RESOURCE_LABELS[form.resourceType],
            datetimeLabel: `${date} · ${created.occurrence?.startTime ?? ""}`,
            notes: form.notes.trim() || undefined,
            createdAtLabel: "همین الان",
          },
          ...previous,
        ]);
      }
      setForm(INITIAL_FORM);
      setRequestKey(newDeskRequestKey());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ثبت رزرو انجام نشد.");
    } finally {
      setPending(false);
    }
  };

  return (
    <OwnerWalkInBookingScreen
      bookings={bookings}
      error={error}
      form={form}
      occurrenceOptions={DEMO_MODE ? undefined : occurrences}
      onFormChange={(patch) =>
        setForm((previous) => ({ ...previous, ...patch }))
      }
      onSubmit={handleSubmit}
      pending={pending}
    />
  );
}
