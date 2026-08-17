import { Typography } from "@heroui/react";
import { useTranslations } from "next-intl";
import { paymentInvoiceDetailsSectionVariants } from "./PaymentInvoiceDetailsSection.styles";
import type { PaymentInvoiceDetailsSectionProps } from "./PaymentInvoiceDetailsSection.types";

export function PaymentInvoiceDetailsSection({
  invoice,
  alreadyPaid,
  className,
}: PaymentInvoiceDetailsSectionProps) {
  const t = useTranslations("Payment");
  const styles = paymentInvoiceDetailsSectionVariants();

  return (
    <div className={className}>
      <section className={styles.intro()}>
        <Typography className={styles.introTitle()} type="h1" weight="bold">
          {t("title")}
        </Typography>
        <Typography className={styles.introSubtitle()} type="body">
          {invoice.title} — {invoice.clubName}
        </Typography>
        {alreadyPaid ? (
          <Typography className="mt-2 text-success" type="body-sm">
            {t("alreadyPaid")}
          </Typography>
        ) : null}
      </section>

      <section className={styles.section()}>
        <Typography className={styles.sectionTitle()} type="body-sm">
          {t("invoiceTitle")}
        </Typography>
        <div className={styles.invoiceCard()}>
          {invoice.items.map((item) => (
            <div key={item.label}>
              <div className={styles.invoiceRow()}>
                <Typography className={styles.invoiceLabel()} type="body-sm">
                  {item.label}
                </Typography>
                <Typography
                  className={styles.invoiceValue()}
                  type="body"
                  weight="medium"
                >
                  {item.amountLabel}
                </Typography>
              </div>
              <div aria-hidden className={styles.divider()} />
            </div>
          ))}

          {invoice.discountLabel ? (
            <>
              <div className={styles.invoiceRow()}>
                <Typography className={styles.invoiceLabel()} type="body-sm">
                  {t("discount")}
                </Typography>
                <Typography
                  className={styles.invoiceDiscount()}
                  type="body"
                  weight="medium"
                >
                  {invoice.discountLabel} −
                </Typography>
              </div>
              <div aria-hidden className={styles.divider()} />
            </>
          ) : null}

          <div className={styles.invoiceRow()}>
            <Typography className={styles.invoiceLabel()} type="body-sm">
              {t("tax")}
            </Typography>
            <Typography
              className={styles.invoiceValue()}
              type="body"
              weight="medium"
            >
              {invoice.taxLabel}
            </Typography>
          </div>

          <div className={styles.totalRow()}>
            <Typography
              className={styles.totalLabel()}
              type="body"
              weight="semibold"
            >
              {t("payable")}
            </Typography>
            <Typography className={styles.totalValue()} type="h4" weight="bold">
              {invoice.totalLabel}
            </Typography>
          </div>
        </div>
      </section>
    </div>
  );
}
