"use client";

import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ApiError, type Invoice } from "@repo/api";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { accountClubs, accountFinance } from "@/shared/lib/api";
import { formatJalaliFullDate, formatTomans } from "@/shared/lib/booking-view";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { useAuth } from "@/shared/providers/AuthProvider";
import { OwnerInvoicesScreen } from "../screens/OwnerInvoicesScreen";
import { OWNER_INVOICES, type OwnerInvoice } from "./owner-invoices-data";

function mapInvoice(invoice: Invoice, unknownCustomer: string): OwnerInvoice {
  return {
    id: invoice.id,
    number: invoice.number,
    amountLabel: formatTomans(invoice.amounts.payable),
    status: invoice.status,
    issuedAtLabel: formatJalaliFullDate(invoice.issuedAt),
    customerLabel: invoice.party.payerDisplayName ?? unknownCustomer,
  };
}

export function OwnerInvoicesGate() {
  const t = useTranslations("OwnerInvoices");
  const { activeRole, isAuthenticated, isReady } = useAuth();
  const [clubId, setClubId] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<OwnerInvoice[] | null>(
    DEMO_MODE ? OWNER_INVOICES : null,
  );
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const clubs = await accountClubs.list({ page_size: 1 });
    const selectedClubId = clubs.result[0]?.id;
    if (!selectedClubId) {
      setClubId(null);
      setInvoices([]);
      return;
    }
    const page = await accountFinance.listClubInvoices(selectedClubId, {
      page_size: 100,
    });
    setClubId(selectedClubId);
    setInvoices(
      page.result.map((invoice) => mapInvoice(invoice, t("unknownCustomer"))),
    );
  }, [t]);

  useEffect(() => {
    if (!isReady || DEMO_MODE) return;
    if (!isAuthenticated || activeRole !== "club_owner") {
      setInvoices([]);
      setError(t("unauthorized"));
      return;
    }
    void load().catch((cause: unknown) => {
      setInvoices([]);
      setError(cause instanceof ApiError ? cause.message : t("loadError"));
    });
  }, [activeRole, isAuthenticated, isReady, load, t]);

  const exportCsv = useCallback(() => {
    if (!invoices?.length) return;
    const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const rows = [
      [t("csvNumber"), t("csvCustomer"), t("csvAmount"), t("csvDate")],
      ...invoices.map((invoice) => [
        invoice.number,
        invoice.customerLabel,
        invoice.amountLabel,
        invoice.issuedAtLabel,
      ]),
    ];
    const blob = new Blob(
      [`\uFEFF${rows.map((row) => row.map(escape).join(",")).join("\n")}`],
      { type: "text/csv;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gym4me-invoices-${clubId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [clubId, invoices, t]);

  if (invoices === null) {
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
      <OwnerInvoicesScreen
        invoices={invoices}
        onExport={invoices.length ? exportCsv : undefined}
      />
    </>
  );
}
