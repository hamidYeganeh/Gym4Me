"use client";

import { Card } from "@heroui/react/card";
import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { discoveryCoachesDetailExperienceSectionVariants } from "./DiscoveryCoachesDetailExperienceSection.styles";
import type { DiscoveryCoachesDetailExperienceSectionProps } from "./DiscoveryCoachesDetailExperienceSection.types";

export function DiscoveryCoachesDetailExperienceSection({
  experience,
  className,
  ...props
}: DiscoveryCoachesDetailExperienceSectionProps) {
  const t = useTranslations("CoachDetail");
  const styles = discoveryCoachesDetailExperienceSectionVariants();
  const { summary, milestones } = experience;

  if (!summary && milestones.length === 0) return null;

  return (
    <section className={styles.root({ className })} {...props}>
      <Typography className={styles.sectionTitle()} type="h4" weight="semibold">
        {t("experienceTitle")}
      </Typography>

      <Card className={styles.card()} variant="transparent">
        {summary ? (
          <Typography className={styles.summary()} type="body-sm">
            {summary}
          </Typography>
        ) : null}

        {milestones.length > 0 ? (
          <ol className={styles.timeline()}>
            {milestones.map((milestone, index) => {
              const isLast = index === milestones.length - 1;

              return (
                <li className={styles.item()} key={milestone.id}>
                  {isLast ? (
                    <span aria-hidden className={styles.railTrail()} />
                  ) : (
                    <span aria-hidden className={styles.rail()} />
                  )}
                  <span
                    aria-hidden
                    className={[
                      styles.marker(),
                      isLast ? styles.markerCurrent() : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span className={styles.markerDot()} />
                  </span>
                  <div className={styles.body()}>
                    <Typography className={styles.year()} type="body-xs">
                      {milestone.year}
                    </Typography>
                    <Typography
                      className={styles.title()}
                      type="body"
                      weight="semibold"
                    >
                      {milestone.title}
                    </Typography>
                    <Typography
                      className={styles.description()}
                      type="body-sm"
                    >
                      {milestone.description}
                    </Typography>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : null}
      </Card>
    </section>
  );
}
