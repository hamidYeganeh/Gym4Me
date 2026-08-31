"use client";

import { ApiError, type Booking, type BookingsListQuery } from "@repo/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  accountClubs,
  clubBookings,
  discoveryClubSlots,
} from "@/shared/lib/api";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { useAuth } from "@/shared/providers/AuthProvider";
import { OwnerBookingsScreen } from "../screens/OwnerBookingsScreen";
import type {
  OwnerBookingAction,
  OwnerBookingClubOption,
  OwnerBookingOccurrenceOption,
  OwnerBookingsFilter,
} from "../screens/OwnerBookingsScreen/OwnerBookingsScreen.types";
import {
  mapOwnerBooking,
  OWNER_BOOKINGS_DEMO,
  type OwnerBookingView,
} from "./owner-bookings-data";

const PAGE_SIZE = 30;

function dateInTehran(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function queryFor(filter: OwnerBookingsFilter, search: string): BookingsListQuery {
  const base: BookingsListQuery = {
    page_size: PAGE_SIZE,
    search: search.trim() || undefined,
    sortBy: "startsAt",
    sortOrder: filter === "past" ? "desc" : "asc",
  };
  if (filter === "active") {
    return {
      ...base,
      bucket: "upcoming",
    };
  }
  if (filter === "past") return { ...base, bucket: "past" };
  if (filter === "cancelled") {
    return {
      ...base,
      bucket: "cancelled",
    };
  }
  return base;
}

function filterDemo(
  rows: OwnerBookingView[],
  filter: OwnerBookingsFilter,
  search: string,
) {
  const normalized = search.trim().toLocaleLowerCase("fa");
  return rows.filter((row) => {
    const statusMatches =
      filter === "all" ||
      (filter === "active" && ["pending", "awaiting_payment", "confirmed", "checked_in"].includes(row.status)) ||
      (filter === "past" && ["completed", "no_show"].includes(row.status)) ||
      (filter === "cancelled" && ["cancelled", "rejected", "refund_requested", "refunded"].includes(row.status));
    const searchMatches =
      !normalized ||
      `${row.athleteName} ${row.athletePhone} ${row.code} ${row.resourceTitle}`
        .toLocaleLowerCase("fa")
        .includes(normalized);
    return statusMatches && searchMatches;
  });
}

export function OwnerBookingsGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [clubs, setClubs] = useState<OwnerBookingClubOption[]>([]);
  const [selectedClubId, setSelectedClubId] = useState("");
  const [bookings, setBookings] = useState<OwnerBookingView[]>(
    DEMO_MODE ? OWNER_BOOKINGS_DEMO : [],
  );
  const [filter, setFilter] = useState<OwnerBookingsFilter>("active");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<string>();
  const [error, setError] = useState<string>();
  const [refresh, setRefresh] = useState(0);
  const [occurrenceOptions, setOccurrenceOptions] = useState<OwnerBookingOccurrenceOption[]>([]);
  const [occurrencesLoading, setOccurrencesLoading] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), 350);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      const demoClubs = [{ id: "demo-club", name: "باشگاه آسمانی" }];
      setClubs(DEMO_MODE ? demoClubs : []);
      setSelectedClubId(DEMO_MODE ? demoClubs[0]!.id : "");
      setLoading(false);
      if (!DEMO_MODE) setError("برای مدیریت رزروها باید با نقش مالک باشگاه وارد شوی.");
      return;
    }

    let active = true;
    setLoading(true);
    accountClubs
      .list({ page: 1, page_size: 100 })
      .then((result) => {
        if (!active) return;
        const next = result.result.map((club) => ({
          id: club.id,
          name: club.identity.name,
        }));
        setClubs(next);
        setSelectedClubId((current) =>
          next.some((club) => club.id === current) ? current : (next[0]?.id ?? ""),
        );
        if (next.length === 0) {
          setLoading(false);
          setError("برای مدیریت رزروها ابتدا یک باشگاه فعال لازم است.");
        }
      })
      .catch((cause) => {
        if (!active) return;
        setLoading(false);
        setError(cause instanceof ApiError ? cause.message : "دریافت باشگاه‌ها ممکن نشد.");
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, isReady]);

  useEffect(() => {
    if (!selectedClubId) return;
    if (DEMO_MODE && !isAuthenticated) {
      setTotal(OWNER_BOOKINGS_DEMO.length);
      setLoading(false);
      setError(undefined);
      return;
    }
    const currentRequest = ++requestId.current;
    setPage(1);
    setLoading(true);
    setError(undefined);
    void clubBookings
      .list(selectedClubId, { ...queryFor(filter, debouncedSearch), page: 1 })
      .then((result) => {
        if (currentRequest !== requestId.current) return;
        setBookings(result.result.map(mapOwnerBooking));
        setTotal(result.pagination.count);
      })
      .catch((cause) => {
        if (currentRequest !== requestId.current) return;
        setBookings([]);
        setError(cause instanceof ApiError ? cause.message : "دریافت رزروهای باشگاه ممکن نشد.");
      })
      .finally(() => {
        if (currentRequest === requestId.current) setLoading(false);
      });
  }, [debouncedSearch, filter, isAuthenticated, refresh, selectedClubId]);

  useEffect(() => {
    if (!selectedClubId || (DEMO_MODE && !isAuthenticated)) {
      setOccurrencesLoading(false);
      setOccurrenceOptions(
        DEMO_MODE
          ? [{ value: "demo-slot|1405-06-10", label: "کلاس پیلاتس · شنبه ۱۰ شهریور · ۱۸:۰۰", resourceType: "class" }]
          : [],
      );
      return;
    }
    let active = true;
    setOccurrencesLoading(true);
    const from = dateInTehran(new Date());
    const to = dateInTehran(new Date(Date.now() + 21 * 86_400_000));
    discoveryClubSlots
      .getCalendar(selectedClubId, { from, to })
      .then((calendar) => {
        if (!active) return;
        setOccurrenceOptions(
          calendar.days.flatMap((day) =>
            day.items
              .filter((item) => item.remaining > 0)
              .map((item) => ({
                value: `${item.slotId}|${day.date}`,
                label: `${item.class?.title ?? item.space?.title ?? "سانس باشگاه"} · ${day.date} · ${item.startTime}–${item.endTime} · ${item.remaining} ظرفیت`,
                resourceType: item.kind,
              })),
          ),
        );
        setOccurrencesLoading(false);
      })
      .catch(() => {
        if (active) {
          setOccurrenceOptions([]);
          setOccurrencesLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, selectedClubId]);

  const replaceBooking = useCallback((booking: Booking) => {
    setBookings((current) =>
      current.map((item) => (item.id === booking.id ? mapOwnerBooking(booking) : item)),
    );
  }, []);

  const handleAction = async (booking: OwnerBookingView, action: OwnerBookingAction) => {
    setPendingBookingId(booking.id);
    setError(undefined);
    try {
      if (DEMO_MODE && !isAuthenticated) {
        const nextStatus = action === "check-in" ? "checked_in" : action === "complete" ? "completed" : action === "no-show" ? "no_show" : "cancelled";
        setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, status: nextStatus } : item));
        return;
      }
      const updated =
        action === "check-in"
          ? await clubBookings.checkIn(selectedClubId, booking.id)
          : action === "complete"
            ? await clubBookings.complete(selectedClubId, booking.id)
            : action === "no-show"
              ? await clubBookings.markNoShow(selectedClubId, booking.id)
              : await clubBookings.cancel(selectedClubId, booking.id, { reasonKey: "club_request" });
      replaceBooking(updated);
      setRefresh((value) => value + 1);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "انجام عملیات رزرو ممکن نشد.");
    } finally {
      setPendingBookingId(undefined);
    }
  };

  const handleReschedule = async (booking: OwnerBookingView, value: string) => {
    const [slotId, date] = value.split("|");
    if (!slotId || !date) return;
    setPendingBookingId(booking.id);
    setError(undefined);
    try {
      if (DEMO_MODE && !isAuthenticated) {
        const selected = occurrenceOptions.find((item) => item.value === value);
        setBookings((current) =>
          current.map((item) =>
            item.id === booking.id && selected
              ? { ...item, startsAtLabel: selected.label }
              : item,
          ),
        );
        return;
      }
      replaceBooking(await clubBookings.reschedule(selectedClubId, booking.id, { slotId, date }));
      setRefresh((value) => value + 1);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "جابه‌جایی رزرو ممکن نشد.");
    } finally {
      setPendingBookingId(undefined);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || bookings.length >= total) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const result = await clubBookings.list(selectedClubId, {
        ...queryFor(filter, debouncedSearch),
        page: nextPage,
      });
      setBookings((current) => [...current, ...result.result.map(mapOwnerBooking)]);
      setPage(nextPage);
      setTotal(result.pagination.count);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "دریافت ادامه رزروها ممکن نشد.");
    } finally {
      setLoadingMore(false);
    }
  };

  const visibleBookings = useMemo(
    () => (DEMO_MODE && !isAuthenticated ? filterDemo(bookings, filter, search) : bookings),
    [bookings, filter, isAuthenticated, search],
  );

  return (
    <OwnerBookingsScreen
      bookings={visibleBookings}
      clubs={clubs}
      error={error}
      filter={filter}
      hasMore={bookings.length < total}
      loading={loading}
      loadingMore={loadingMore}
      occurrenceOptions={occurrenceOptions}
      occurrencesLoading={occurrencesLoading}
      pendingBookingId={pendingBookingId}
      search={search}
      selectedClubId={selectedClubId}
      onAction={handleAction}
      onClubChange={setSelectedClubId}
      onFilterChange={setFilter}
      onLoadMore={() => void handleLoadMore()}
      onReschedule={handleReschedule}
      onRetry={() => setRefresh((value) => value + 1)}
      onSearchChange={setSearch}
    />
  );
}
