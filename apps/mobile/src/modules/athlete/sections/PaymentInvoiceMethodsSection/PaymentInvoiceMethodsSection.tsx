import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { paymentInvoiceMethodsSectionVariants } from "./PaymentInvoiceMethodsSection.styles";
import type { PaymentInvoiceMethodsSectionProps } from "./PaymentInvoiceMethodsSection.types";

export function PaymentInvoiceMethodsSection({
  methods,
  selectedMethod,
  onSelectMethod,
  className,
}: PaymentInvoiceMethodsSectionProps) {
  const t = useTranslations("Payment");
  const styles = paymentInvoiceMethodsSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <Typography className={styles.sectionTitle()} type="body-sm">
        {t("methodTitle")}
      </Typography>
      <div className={styles.methods()}>
        {methods.map((method) => {
          const isSelected = selectedMethod === method.id;

          return (
            <Button
              className={`${styles.methodCard()} ${ isSelected ? styles.methodCardSelected() : "" }`}
              key={method.id}
              onPress={() => onSelectMethod(method.id)}
              size="lg"
              variant="ghost"
            >
              <span aria-hidden className={styles.methodIcon()}>
                {method.icon}
              </span>
              <span className={styles.methodBody()}>
                <Typography
                  className={styles.methodTitle()}
                  type="body"
                  weight="semibold"
                >
                  {method.title}
                </Typography>
                <Typography className={styles.methodHint()} type="body-sm">
                  {method.hint}
                </Typography>
              </span>
              <span
                aria-hidden
                className={`${styles.methodRadio()} ${
                  isSelected ? styles.methodRadioSelected() : ""
                }`}
              >
                {isSelected ? (
                  <span className={styles.methodRadioDot()} />
                ) : null}
              </span>
            </Button>
          );
        })}
      </div>
    </section>
  );
}
