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

const RESULT_ICON_SIZE = 48;

export function PaymentResultScreen({
  defaultStatus = "success",
}: PaymentResultScreenProps) {
  const t = useTranslations("Payment.result");
  const router = useRouter();
  const searchParams = useSearchParams();

  const status: PaymentResultStatus =
    searchParams.get("status") === "failed" ? "failed" : defaultStatus;
  const invoiceId = searchParams.get("invoice");
  const invoice =
    invoiceId && isDiscoveryDemoId(invoiceId)
      ? getInvoice(invoiceId)
      : undefined;
  const reference = searchParams.get("reference") ?? invoiceId ?? "—";
  const isSuccess = status === "success";

  return (
    <AppLayout
      className={styles.root}
      header={<SecondaryPageHeader showBack={false} title={t("pageTitle")} />}
    >
      <div className={styles.content}>
        <EmptyState
          description={isSuccess ? t("successBody") : t("failedBody")}
          icon={
            isSuccess ? (
              <CheckCircle size={RESULT_ICON_SIZE} />
            ) : (
              <CloseXCircle size={RESULT_ICON_SIZE} />
            )
          }
          layout="icon"
          primaryAction={{
            label: isSuccess ? t("viewBookings") : t("retry"),
            endContent: isSuccess ? <ArrowRight size={18} /> : undefined,
            onPress: () =>
              isSuccess ? router.push("/athlete/bookings") : router.back(),
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
          title={isSuccess ? t("successTitle") : t("failedTitle")}
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
