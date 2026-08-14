"use client";

import { useMemo, useState } from "react";
import { OwnerCashShiftScreen } from "../screens/OwnerCashShiftScreen";
import {
  OWNER_CASH_SHIFT,
  type OwnerCashShiftData,
} from "./owner-cash-shift-data";

export function OwnerCashShiftGate() {
  const [shift, setShift] = useState<OwnerCashShiftData>(OWNER_CASH_SHIFT);
  const [countedByChannel, setCountedByChannel] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries(
      OWNER_CASH_SHIFT.channels.map((row) => [row.channel, ""]),
    ),
  );
  const [discrepancyReason, setDiscrepancyReason] = useState("");
  const [pending, setPending] = useState(false);

  const totalCountedLabel = useMemo(() => {
    const total = shift.channels.reduce((sum, row) => {
      const raw = countedByChannel[row.channel]?.replace(/[^\d]/g, "") ?? "";
      return sum + (Number(raw) || 0);
    }, 0);
    return total > 0 ? `${total.toLocaleString("fa-IR")} تومان` : "—";
  }, [shift.channels, countedByChannel]);

  const handleClose = () => {
    setPending(true);
    setTimeout(() => {
      setShift((previous) => ({
        ...previous,
        status: "closed",
        discrepancyReason: discrepancyReason.trim() || undefined,
        totalCountedLabel,
        channels: previous.channels.map((row) => ({
          ...row,
          countedLabel:
            countedByChannel[row.channel]?.trim() ||
            row.expectedLabel,
        })),
      }));
      setPending(false);
    }, 400);
  };

  return (
    <OwnerCashShiftScreen
      countedByChannel={countedByChannel}
      discrepancyReason={discrepancyReason}
      onClose={shift.status === "open" ? handleClose : undefined}
      onCountedChange={(channel, value) =>
        setCountedByChannel((previous) => ({ ...previous, [channel]: value }))
      }
      onDiscrepancyChange={setDiscrepancyReason}
      pending={pending}
      shift={shift}
    />
  );
}
