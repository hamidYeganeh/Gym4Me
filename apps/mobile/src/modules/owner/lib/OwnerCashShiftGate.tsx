"use client";

import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ApiError, type CashShift, type CashShiftTotals } from "@repo/api";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatJalaliDateTime, formatTomans } from "@/shared/lib/booking-view";
import { accountClubs, accountFinance } from "@/shared/lib/api";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { useAuth } from "@/shared/providers/AuthProvider";
import { OwnerCashShiftScreen } from "../screens/OwnerCashShiftScreen";
import {
  OWNER_CASH_SHIFT,
  type OwnerCashShiftData,
} from "./owner-cash-shift-data";

export function OwnerCashShiftGate() {
  const t = useTranslations("OwnerCashShift");
  const { activeRole, isAuthenticated, isReady } = useAuth();
  const [clubId, setClubId] = useState<string | null>(null);
  const [shift, setShift] = useState<OwnerCashShiftData | null>(
    DEMO_MODE ? OWNER_CASH_SHIFT : null,
  );
  const [countedByChannel, setCountedByChannel] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries((shift?.channels ?? []).map((row) => [row.channel, ""])),
  );
  const [discrepancyReason, setDiscrepancyReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emptyShift = useCallback(
    (): OwnerCashShiftData => ({
      id: "none",
      status: "closed",
      openedAtLabel: "—",
      openedByLabel: "—",
      channels: [],
      totalExpectedLabel: "—",
      totalCountedLabel: "—",
    }),
    [],
  );

  const mapShift = useCallback((item: CashShift): OwnerCashShiftData => {
    const expected = item.expected;
    const counted = item.counted;
    const channels: OwnerCashShiftData["channels"] = [
      ["cash", expected?.cash ?? 0, counted?.cash ?? 0],
      ["pos", expected?.pos ?? 0, counted?.pos ?? 0],
      ["card_to_card", expected?.cardToCard ?? 0, counted?.cardToCard ?? 0],
      ["gateway", expected?.other ?? 0, counted?.other ?? 0],
    ].map(([channel, expectedAmount, countedAmount]) => ({
      channel: channel as OwnerCashShiftData["channels"][number]["channel"],
      expectedLabel: formatTomans(Number(expectedAmount)),
      countedLabel: formatTomans(Number(countedAmount)),
    }));
    const total = (values?: CashShiftTotals | null) =>
      values
        ? values.cash + values.pos + values.cardToCard + values.other
        : 0;
    return {
      id: item._id,
      status: item.status,
      openedAtLabel: formatJalaliDateTime(item.openedAt),
      openedByLabel: `…${item.openedBy.slice(-6)}`,
      channels,
      discrepancyReason: item.varianceNote ?? undefined,
      totalExpectedLabel: expected ? formatTomans(total(expected)) : "—",
      totalCountedLabel: counted ? formatTomans(total(counted)) : "—",
    };
  }, []);

  const load = useCallback(async () => {
    setError(null);
    const clubs = await accountClubs.list({ page_size: 1 });
    const selectedClubId = clubs.result[0]?.id;
    if (!selectedClubId) {
      setClubId(null);
      setShift(emptyShift());
      return;
    }
    const open = await accountFinance.getOpenCashShift(selectedClubId);
    setClubId(selectedClubId);
    setShift(open ? mapShift(open) : emptyShift());
    setCountedByChannel({});
  }, [emptyShift, mapShift]);

  useEffect(() => {
    if (!isReady || DEMO_MODE) return;
    if (!isAuthenticated || activeRole !== "club_owner") {
      setShift(emptyShift());
      setError(t("unauthorized"));
      return;
    }
    void load().catch((cause: unknown) => {
      setShift(emptyShift());
      setError(cause instanceof ApiError ? cause.message : t("loadError"));
    });
  }, [activeRole, emptyShift, isAuthenticated, isReady, load, t]);

  const parseAmount = (value: string | undefined): number => {
    const latin = (value ?? "")
      .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
      .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
      .replace(/[^\d]/g, "");
    return Number(latin) || 0;
  };

  const totalCountedLabel = useMemo(() => {
    const total = (shift?.channels ?? []).reduce((sum, row) => {
      return sum + parseAmount(countedByChannel[row.channel]);
    }, 0);
    return total > 0 ? `${total.toLocaleString("fa-IR")} تومان` : "—";
  }, [shift?.channels, countedByChannel]);

  const handleClose = async () => {
    if (!shift || !clubId) return;
    setPending(true);
    setError(null);
    try {
      if (DEMO_MODE) {
        setShift({ ...shift, status: "closed", totalCountedLabel });
        return;
      }
      await accountFinance.closeCashShift(clubId, shift.id, {
        counted: {
          cash: parseAmount(countedByChannel.cash),
          pos: parseAmount(countedByChannel.pos),
          cardToCard: parseAmount(countedByChannel.card_to_card),
          other: parseAmount(countedByChannel.gateway),
        },
        varianceNote: discrepancyReason.trim() || undefined,
      });
      await load();
    } catch (cause: unknown) {
      setError(cause instanceof ApiError ? cause.message : t("closeError"));
    } finally {
      setPending(false);
    }
  };

  const handleOpen = async () => {
    if (!clubId) return;
    setPending(true);
    setError(null);
    try {
      const opened = await accountFinance.openCashShift(clubId);
      setShift(mapShift(opened));
    } catch (cause: unknown) {
      setError(cause instanceof ApiError ? cause.message : t("openError"));
    } finally {
      setPending(false);
    }
  };

  if (!shift) {
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
          <Typography className="text-danger" type="body-sm">{error}</Typography>
          <Button onPress={() => void load()} size="lg" variant="secondary">
            {t("retry")}
          </Button>
        </div>
      ) : null}
      <OwnerCashShiftScreen
        countedByChannel={countedByChannel}
        discrepancyReason={discrepancyReason}
        onClose={shift.status === "open" ? () => void handleClose() : undefined}
        onCountedChange={(channel, value) =>
          setCountedByChannel((previous) => ({ ...previous, [channel]: value }))
        }
        onDiscrepancyChange={setDiscrepancyReason}
        onOpen={clubId && shift.status === "closed" ? () => void handleOpen() : undefined}
        pending={pending}
        shift={shift}
      />
    </>
  );
}
