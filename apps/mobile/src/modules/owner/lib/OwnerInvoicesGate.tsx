"use client";

import { OwnerInvoicesScreen } from "../screens/OwnerInvoicesScreen";
import { OWNER_INVOICES } from "./owner-invoices-data";

export function OwnerInvoicesGate() {
  return (
    <OwnerInvoicesScreen
      invoices={OWNER_INVOICES}
      onExport={() => {
        void navigator.clipboard?.writeText(
          OWNER_INVOICES.map((invoice) => invoice.number).join("\n"),
        );
      }}
    />
  );
}
