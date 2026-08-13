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
        header={
          <Header startContent={backButton} />
        }
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
      header={
        <Header startContent={backButton} />
      }
    >
      <div className={styles.content}>
        <section className={styles.intro}>
          <Typography className={styles.introTitle} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle} type="body">
            {invoice.title} — {invoice.clubName}
          </Typography>
          {alreadyPaid ? (
            <Typography className="mt-2 text-success" type="body-sm">
              {t("alreadyPaid")}
            </Typography>
          ) : null}
        </section>

        <section className={styles.section}>
          <Typography className={styles.sectionTitle} type="body-sm">
            {t("invoiceTitle")}
          </Typography>
          <div className={styles.invoiceCard}>
            {invoice.items.map((item) => (
              <div key={item.label}>
                <div className={styles.invoiceRow}>
                  <Typography className={styles.invoiceLabel} type="body-sm">
                    {item.label}
                  </Typography>
                  <Typography
                    className={styles.invoiceValue}
                    type="body"
                    weight="medium"
                  >
                    {item.amountLabel}
                  </Typography>
                </div>
                <div aria-hidden className={styles.divider} />
              </div>
            ))}

            {invoice.discountLabel ? (
              <>
                <div className={styles.invoiceRow}>
                  <Typography className={styles.invoiceLabel} type="body-sm">
                    {t("discount")}
                  </Typography>
                  <Typography
                    className={styles.invoiceDiscount}
                    type="body"
                    weight="medium"
                  >
                    {invoice.discountLabel} −
                  </Typography>
                </div>
                <div aria-hidden className={styles.divider} />
              </>
            ) : null}

            <div className={styles.invoiceRow}>
              <Typography className={styles.invoiceLabel} type="body-sm">
                {t("tax")}
              </Typography>
              <Typography
                className={styles.invoiceValue}
                type="body"
                weight="medium"
              >
                {invoice.taxLabel}
              </Typography>
            </div>

            <div className={styles.totalRow}>
              <Typography
                className={styles.totalLabel}
                type="body"
                weight="semibold"
              >
                {t("payable")}
              </Typography>
              <Typography className={styles.totalValue} type="h4" weight="bold">
                {invoice.totalLabel}
              </Typography>
            </div>
          </div>
        </section>

        {!alreadyPaid ? (
          <section className={styles.section}>
            <Typography className={styles.sectionTitle} type="body-sm">
              {t("methodTitle")}
            </Typography>
            <div className={styles.methods}>
              {methods.map((method) => {
                const isSelected = selectedMethod === method.id;

                return (
                  <Button
                    className={`${styles.methodCard} ${
                      isSelected ? styles.methodCardSelected : ""
                    }`}
                    key={method.id}
                    onPress={() => setSelectedMethod(method.id)}
                    size="lg"
                    variant="ghost"
                  >
                    <span aria-hidden className={styles.methodIcon}>
                      {method.icon}
                    </span>
                    <span className={styles.methodBody}>
                      <Typography
                        className={styles.methodTitle}
                        type="body"
                        weight="semibold"
                      >
                        {method.title}
                      </Typography>
                      <Typography className={styles.methodHint} type="body-sm">
                        {method.hint}
                      </Typography>
                    </span>
                    <span
                      aria-hidden
                      className={`${styles.methodRadio} ${
                        isSelected ? styles.methodRadioSelected : ""
                      }`}
                    >
                      {isSelected ? (
                        <span className={styles.methodRadioDot} />
                      ) : null}
                    </span>
                  </Button>
                );
              })}
            </div>
          </section>
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
