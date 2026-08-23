"use client";

import { OwnerInvoicesScreen } from "../screens/OwnerInvoicesScreen";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { OWNER_INVOICES } from "./owner-invoices-data";

export function OwnerInvoicesGate() {
  return (
    <OwnerInvoicesScreen
      invoices={DEMO_MODE ? OWNER_INVOICES : []}
      onExport={
        DEMO_MODE
          ? () => {
              void navigator.clipboard?.writeText(
                OWNER_INVOICES.map((invoice) => invoice.number).join("\n"),
              );
            }
          : undefined
      }
    />
  );
}
