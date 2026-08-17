"use client";

import { Button, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { CreditCard } from "@repo/icons/CreditCard";
import { Wallet } from "@repo/icons/Wallet";
import { StickyBottomActions } from "@repo/ui/kit/StickyBottomActions";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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

  const backButton = (
    <Button
      aria-label={t("back")}
      isIconOnly
      onPress={() => router.back()}
      size="lg"
      variant="ghost"
    >
      <ChevronLeft className="text-foreground" size={22} />
    </Button>
  );

  if (!invoice) {
    return (
      <AppLayout
        className={styles.root}
        header={<Header startContent={backButton} />}
      >
        <div className={styles.content}>
          <div className={styles.empty}>
            <Typography className={styles.emptyTitle} type="h4" weight="semibold">
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
    <AppLayout
      className={styles.root}
      header={<Header startContent={backButton} />}
    >
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
