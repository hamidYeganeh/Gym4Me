"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { CreditCard } from "@repo/icons/CreditCard";
import { Wallet } from "@repo/icons/Wallet";
import { StickyBottomActions } from "@repo/ui/kit/StickyBottomActions";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useState, type ReactNode } from "react";
import { PaymentInvoiceDetailsSection } from "../../sections/PaymentInvoiceDetailsSection";
import { PaymentInvoiceMethodsSection } from "../../sections/PaymentInvoiceMethodsSection";
import { paymentInvoiceScreenStyles as styles } from "./PaymentInvoiceScreen.styles";
import type {
  PaymentInvoiceScreenProps,
  PaymentMethodId,
} from "./PaymentInvoiceScreen.types";

const METHOD_ICON_SIZE = 22;

export function PaymentInvoiceScreen({
  invoice,
  walletBalanceLabel,
  alreadyPaid = false,
  pending = false,
  onPay,
  onPaidContinue,
}: PaymentInvoiceScreenProps) {
  const t = useTranslations("Payment");
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethodId>("gateway");

  const pageHeader = (
    <SecondaryPageHeader
      backAriaLabel={t("back")}
      onBack={() => router.back()}
      title={t("title")}
    />
  );

  if (!invoice) {
    return (
      <AppLayout className={styles.root} header={pageHeader}>
        <div className={styles.content}>
          <div className={styles.empty}>
            <Typography
              className={styles.emptyTitle}
              type="h4"
              weight="semibold"
            >
              {t("notFound")}
            </Typography>
          </div>
        </div>
      </AppLayout>
    );
  }

  const methods: {
    id: PaymentMethodId;
    icon: ReactNode;
    title: string;
    hint: string;
  }[] = [
    {
      id: "wallet",
      icon: <Wallet size={METHOD_ICON_SIZE} />,
      title: t("wallet"),
      hint: t("walletBalance", { balance: walletBalanceLabel }),
    },
    {
      id: "gateway",
      icon: <CreditCard size={METHOD_ICON_SIZE} />,
      title: t("gateway"),
      hint: t("gatewayHint"),
    },
  ];

  return (
    <AppLayout className={styles.root} header={pageHeader}>
      <div className={styles.content}>
        <PaymentInvoiceDetailsSection
          alreadyPaid={alreadyPaid}
          invoice={invoice}
        />

        {!alreadyPaid ? (
          <PaymentInvoiceMethodsSection
            methods={methods}
            selectedMethod={selectedMethod}
            onSelectMethod={setSelectedMethod}
          />
        ) : null}
      </div>

      <StickyBottomActions>
        <Button
          className={styles.payCta}
          isDisabled={pending}
          onPress={() => {
            if (alreadyPaid) {
              if (onPaidContinue) {
                onPaidContinue();
                return;
              }
              router.push("/athlete/memberships");
              return;
            }
            if (onPay) {
              onPay(selectedMethod);
              return;
            }
            router.push(
              `/athlete/payment/result?status=success&invoice=${invoice.id}`,
            );
          }}
          size="lg"
          variant="primary"
        >
          {alreadyPaid ? t("paidCta") : t("payCta")}
        </Button>
      </StickyBottomActions>
    </AppLayout>
  );
}
