"use client";

import { useState } from "react";
import { OwnerDebtsScreen } from "../screens/OwnerDebtsScreen";
import { OWNER_DEBTS, type OwnerDebtEntry } from "./owner-debts-data";

export function OwnerDebtsGate() {
  const [debts, setDebts] = useState(OWNER_DEBTS);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleRecordPayment = (debt: OwnerDebtEntry) => {
    setPendingId(debt.id);
    setTimeout(() => {
      setDebts((previous) =>
        previous.map((entry) =>
          entry.id === debt.id
            ? {
                ...entry,
                status: "settled" as const,
                remainingLabel: "۰ تومان",
              }
            : entry,
        ),
      );
      setPendingId(null);
    }, 400);
  };

  return (
    <OwnerDebtsScreen
      debts={debts}
      onRecordPayment={handleRecordPayment}
      pendingId={pendingId}
    />
  );
}
