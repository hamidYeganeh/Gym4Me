"use client";

import { Button, Chip, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { FileDownload } from "@repo/icons/FileDownload";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { OwnerInvoiceStatus } from "../../lib/owner-invoices-data";
import { ownerInvoicesScreenVariants } from "./OwnerInvoicesScreen.styles";
import type { OwnerInvoicesScreenProps } from "./OwnerInvoicesScreen.types";

const STATUS_COLOR: Record<
  OwnerInvoiceStatus,
  "success" | "warning" | "default" | "danger"
> = {
  draft: "default",
  issued: "warning",
  paid: "success",
  void: "danger",
};

const STATUS_KEY = {
  draft: "statusDraft",
  issued: "statusIssued",
  paid: "statusPaid",
  void: "statusVoid",
} as const;

export function OwnerInvoicesScreen({
  invoices,
  onExport,
  className,
}: OwnerInvoicesScreenProps) {
  const t = useTranslations("OwnerInvoices");
  const router = useRouter();
  const styles = ownerInvoicesScreenVariants();

  return (
    <AppLayout
      className={[styles.root(), className].filter(Boolean).join(" ")}
      header={
        <Header
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
        />
      }
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.introTitle()} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle()} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        {onExport ? (
          <div className={styles.actions()}>
            <Button onPress={onExport} size="lg" variant="secondary">
              <FileDownload aria-hidden size={20} />
              {t("export")}
            </Button>
          </div>
        ) : null}

        <section className={styles.section()}>
          {invoices.length === 0 ? (
            <div className={styles.empty()}>{t("empty")}</div>
          ) : (
            <div className={styles.card()}>
              {invoices.map((invoice, index) => (
                <div key={invoice.id}>
                  <div className={styles.row()}>
                    <span className={styles.rowBody()}>
                      <Typography className={styles.rowLabel()} type="body" weight="semibold">
                        {invoice.number}
                      </Typography>
                      <Typography className={styles.rowHint()} type="body-sm">
                        {invoice.customerLabel} · {invoice.issuedAtLabel}
                      </Typography>
                    </span>
                    <span className="flex flex-col items-end gap-1">
                      <span className={styles.rowValue()}>{invoice.amountLabel}</span>
                      <Chip
                        color={STATUS_COLOR[invoice.status]}
                        size="sm"
                        variant="soft"
                      >
                        <Chip.Label>{t(STATUS_KEY[invoice.status])}</Chip.Label>
                      </Chip>
                    </span>
                  </div>
                  {index < invoices.length - 1 ? (
                    <div aria-hidden className={styles.divider()} />
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
