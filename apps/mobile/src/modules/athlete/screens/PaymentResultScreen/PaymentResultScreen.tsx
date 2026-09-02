"use client";

import { Typography } from "@heroui/react/typography";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { CheckCircle } from "@repo/icons/CheckCircle";
import { CloseXCircle } from "@repo/icons/CloseXCircle";
import { EmptyState } from "@repo/ui/kit/EmptyState";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { getInvoice } from "../../lib/payment-data";
import { paymentResultScreenStyles as styles } from "./PaymentResultScreen.styles";
import type {
  PaymentResultScreenProps,
  PaymentResultStatus,
} from "./PaymentResultScreen.types";
import { useRouter } from "@/shared/lib/app-router";
import { isDiscoveryDemoId } from "@/shared/lib/api";
import { isPaymentReturnPath } from "@/shared/lib/payment-return";

const RESULT_ICON_SIZE = 48;

export function PaymentResultScreen({
  defaultStatus = "success",
}: PaymentResultScreenProps) {
  const t = useTranslations("Payment.result");
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawStatus = searchParams.get("status");
  const status: PaymentResultStatus =
    rawStatus === "failed" || rawStatus === "cancelled" ? rawStatus : defaultStatus;
  const invoiceId = searchParams.get("invoice");
  const invoice =
    invoiceId && isDiscoveryDemoId(invoiceId)
      ? getInvoice(invoiceId)
      : undefined;
  const reference = searchParams.get("reference") ?? invoiceId ?? "—";
  const rawReturnPath = searchParams.get("returnPath") ?? "";
  const returnPath = isPaymentReturnPath(rawReturnPath) ? rawReturnPath : "/athlete/bookings";
  const isSuccess = status === "success";
  const isCancelled = status === "cancelled";
  const title = isSuccess
    ? t("successTitle")
    : isCancelled
      ? t("cancelledTitle")
      : t("failedTitle");
  const description = isSuccess
    ? t("successBody")
    : isCancelled
      ? t("cancelledBody")
      : t("failedBody");

  return (
    <AppLayout
      className={styles.root}
      header={<SecondaryPageHeader showBack={false} title={t("pageTitle")} />}
    >
      <div className={styles.content}>
        <EmptyState
          description={description}
          icon={
            isSuccess ? (
              <CheckCircle size={RESULT_ICON_SIZE} />
            ) : (
              <CloseXCircle size={RESULT_ICON_SIZE} />
            )
          }
          layout="icon"
          primaryAction={{
            label: isSuccess || isCancelled ? t("viewBookings") : t("retry"),
            endContent: isSuccess ? <ArrowRight size={18} /> : undefined,
            onPress: () =>
              isSuccess || isCancelled ? router.push(returnPath) : router.back(),
          }}
          secondaryAction={{
            label: isSuccess ? t("seeInvoice") : t("backHome"),
            onPress: () =>
              isSuccess
                ? router.push(
                    invoiceId
                      ? `/athlete/payment/${invoiceId}`
                      : "/athlete/wallet",
                  )
                : router.push("/athlete"),
          }}
          status={isSuccess ? "success" : "danger"}
          title={title}
        />

        {isSuccess ? (
          <div className={styles.detailsCard}>
            {invoice ? (
              <>
                <div className={styles.detailRow}>
                  <Typography className={styles.detailLabel} type="body-sm">
                    {t("amountLabel")}
                  </Typography>
                  <Typography
                    className={styles.detailValue}
                    type="body"
                    weight="semibold"
                  >
                    {invoice.totalLabel}
                  </Typography>
                </div>
                <div aria-hidden className={styles.divider} />
              </>
            ) : null}
            <div className={styles.detailRow}>
              <Typography className={styles.detailLabel} type="body-sm">
                {t("referenceLabel")}
              </Typography>
              <Typography
                className={styles.detailValue}
                type="body"
                weight="medium"
              >
                {reference}
              </Typography>
            </div>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
