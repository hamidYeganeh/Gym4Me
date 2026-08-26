"use client";

import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ApiError, type CalendarBlock } from "@repo/api";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { faDigits } from "@/shared/lib/booking-view";
import { accountCalendar, accountClubs } from "@/shared/lib/api";
import { isoToJalaliDisplay, jalaliDisplayToIso } from "@/shared/lib/jalali";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { useAuth } from "@/shared/providers/AuthProvider";
import { OwnerHolidaysScreen } from "../screens/OwnerHolidaysScreen";
import type { OwnerHolidayForm } from "../screens/OwnerHolidaysScreen/OwnerHolidaysScreen.types";
import { OWNER_HOLIDAYS, type OwnerHolidaysData } from "./owner-holidays-data";

export function OwnerHolidaysGate() {
  const t = useTranslations("OwnerHolidays");
  const { activeRole, isAuthenticated, isReady } = useAuth();
  const [clubId, setClubId] = useState<string | null>(null);
  const [data, setData] = useState<OwnerHolidaysData | null>(
    DEMO_MODE ? OWNER_HOLIDAYS : null,
  );
  const [form, setForm] = useState<OwnerHolidayForm>({
    title: "",
    jalaliDate: "",
  });
  const [pending, setPending] = useState(false);
  const [pendingHolidayId, setPendingHolidayId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const createAttempt = useRef<{ fingerprint: string; key: string } | null>(
    null,
  );

  const mapHoliday = useCallback(
    (block: CalendarBlock) => ({
      id: block.id,
      title: block.note?.trim() || t("customFallback"),
      jalaliDateLabel: faDigits(isoToJalaliDisplay(block.window.from)),
      isOfficial: false,
      fromIso: block.window.from,
    }),
    [t],
  );

  const load = useCallback(async () => {
    setError(null);
    const clubs = await accountClubs.list({ page_size: 1 });
    const selectedClubId = clubs.result[0]?.id;
    if (!selectedClubId) {
      setClubId(null);
      setData({ holidays: [], programs: [] });
      return;
    }
    const page = await accountCalendar.listClubBlocks(selectedClubId, {
      page_size: 100,
      resourceType: "club",
      resourceId: selectedClubId,
      status: "active",
    });
    setClubId(selectedClubId);
    setData({
      holidays: page.result
        .filter((block) => block.reason === "holiday")
        .map(mapHoliday),
      programs: [],
    });
  }, [mapHoliday]);

  useEffect(() => {
    if (!isReady || DEMO_MODE) return;
    if (!isAuthenticated || activeRole !== "club_owner") {
      setData({ holidays: [], programs: [] });
      setError(t("unauthorized"));
      return;
    }
    void load().catch((cause: unknown) => {
      setData({ holidays: [], programs: [] });
      setError(cause instanceof ApiError ? cause.message : t("loadError"));
    });
  }, [activeRole, isAuthenticated, isReady, load, t]);

  const dayWindow = useCallback((isoDate: string) => {
    const from = new Date(`${isoDate}T00:00:00+03:30`);
    const to = new Date(from.getTime() + 24 * 60 * 60 * 1000);
    return { from: from.toISOString(), to: to.toISOString() };
  }, []);

  const handleAdd = async () => {
    if (!clubId) return;
    const isoDate = jalaliDisplayToIso(form.jalaliDate);
    if (!isoDate) {
      setError(t("dateError"));
      return;
    }
    setPending(true);
    setError(null);
    const fingerprint = JSON.stringify({
      title: form.title.trim(),
      isoDate,
    });
    if (createAttempt.current?.fingerprint !== fingerprint) {
      createAttempt.current = { fingerprint, key: crypto.randomUUID() };
    }
    try {
      await accountCalendar.upsertClubBlock(clubId, {
        clientMutationId: createAttempt.current.key,
        resource: { type: "club", id: clubId },
        reason: "holiday",
        window: dayWindow(isoDate),
        note: form.title.trim(),
      });
      createAttempt.current = null;
      setForm({ title: "", jalaliDate: "" });
      await load();
    } catch (cause: unknown) {
      setError(cause instanceof ApiError ? cause.message : t("createError"));
    } finally {
      setPending(false);
    }
  };

  const removeHoliday = useCallback(
    async (id: string) => {
      if (!clubId) return;
      setPendingHolidayId(id);
      setError(null);
      try {
        await accountCalendar.removeClubBlock(clubId, id);
        await load();
      } catch (cause: unknown) {
        setError(
          cause instanceof ApiError ? cause.message : t("removeError"),
        );
      } finally {
        setPendingHolidayId(null);
      }
    },
    [clubId, load, t],
  );

  if (!data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner aria-label={t("loading")} size="lg" />
      </div>
    );
  }

  return (
    <>
      {error ? (
        <div className="flex flex-col items-center gap-2 px-4 pt-3" role="alert">
          <Typography className="text-danger" type="body-sm">
            {error}
          </Typography>
          {clubId ? (
            <Button onPress={() => void load()} size="sm" variant="secondary">
              {t("retry")}
            </Button>
          ) : null}
        </div>
      ) : null}
      <OwnerHolidaysScreen
        data={data}
        form={form}
        onAddHoliday={clubId ? () => void handleAdd() : undefined}
        onFormChange={(patch) =>
          setForm((previous) => ({ ...previous, ...patch }))
        }
        onRemoveHoliday={clubId ? (id) => void removeHoliday(id) : undefined}
        pending={pending}
        pendingHolidayId={pendingHolidayId}
      />
    </>
  );
}
