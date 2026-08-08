import { Fragment } from "react";
import { Card, Chip } from "@heroui/react";
import { useTranslations } from "next-intl";
import {
  formatFaNumber,
  formatFaPercent,
} from "../../lib/analytics-data";
import { analyticsFunnelSectionVariants } from "./AnalyticsFunnelSection.styles";
import type { AnalyticsFunnelSectionProps } from "./AnalyticsFunnelSection.types";

export function AnalyticsFunnelSection({
  steps,
  className,
}: AnalyticsFunnelSectionProps) {
  const t = useTranslations("Admin.Analytics.funnel");
  const styles = analyticsFunnelSectionVariants();

  const maxCount = Math.max(...steps.map((step) => step.count), 1);

  return (
    <Card className={styles.card({ className })}>
      <Card.Header className={styles.cardHeader()}>
        <Card.Title className={styles.cardTitle()}>{t("title")}</Card.Title>
        <Card.Description className={styles.cardDescription()}>
          {t("description")}
        </Card.Description>
      </Card.Header>
      <Card.Content className={styles.content()}>
        {steps.map((step, index) => {
          const previous = steps[index - 1];
          const conversion =
            previous && previous.count > 0
              ? (step.count / previous.count) * 100
              : null;

          return (
            <Fragment key={step.id}>
              {conversion !== null ? (
                <div className={styles.conversion()}>
                  <span aria-hidden className={styles.conversionLine()} />
                  <Chip
                    aria-label={`${t("conversionAriaLabel")}: ${formatFaPercent(conversion)}`}
                    color={conversion >= 50 ? "success" : "warning"}
                    size="sm"
                    variant="soft"
                  >
                    {formatFaPercent(conversion)}
                  </Chip>
                </div>
              ) : null}
              <div className={styles.step()}>
                <div className={styles.stepTop()}>
                  <span className={styles.stepLabel()}>
                    {t(`steps.${step.id}`)}
                  </span>
                  <span className={styles.stepCount()}>
                    {formatFaNumber(step.count)}
                  </span>
                </div>
                <div className={styles.track()}>
                  <span
                    className={styles.fill()}
                    style={{
                      width: `${Math.max((step.count / maxCount) * 100, 2)}%`,
                    }}
                  />
                </div>
              </div>
            </Fragment>
          );
        })}
      </Card.Content>
    </Card>
  );
}
