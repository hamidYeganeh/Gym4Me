"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { Check } from "@repo/icons/Check";
import { useTranslations } from "next-intl";
import { discoveryClubsReservePlanStepSectionVariants as styles } from "./DiscoveryClubsReservePlanStepSection.styles";
import type { DiscoveryClubsReservePlanStepSectionProps } from "./DiscoveryClubsReservePlanStepSection.types";

export function DiscoveryClubsReservePlanStepSection({
  plans,
  selectedPlanId,
  onPlanPress,
  getPlanPrice,
}: DiscoveryClubsReservePlanStepSectionProps) {
  const t = useTranslations("ReserveFlow");
  const slots = styles();

  return (
    <section className={slots.section()}>
      <Typography className={slots.sectionTitle()} type="h4" weight="semibold">
        {t("plansTitle")}
      </Typography>
      <div className={slots.plans()}>
        {plans.map((plan) => {
          const selected = selectedPlanId === plan.id;
          return (
            <Button
              className={[
                slots.planCard(),
                selected ? slots.planCardSelected() : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={plan.id}
              onPress={() => onPlanPress(plan.id)}
              size="lg"
              variant="ghost"
            >
              <span className={slots.planHeader()}>
                <span className={slots.planTitleBlock()}>
                  <Typography
                    className={slots.planTitle()}
                    type="body"
                    weight="semibold"
                  >
                    {plan.title}
                  </Typography>
                  <span className={slots.planPriceRow()}>
                    <span className={slots.planPrice()}>
                      {getPlanPrice(plan).toLocaleString("en-US")}
                    </span>
                    {plan.priceSuffix ? (
                      <span className={slots.planPriceSuffix()}>
                        {plan.priceSuffix}
                      </span>
                    ) : null}
                  </span>
                </span>
                {selected ? (
                  <Check
                    aria-hidden
                    className={slots.planCheck()}
                    size={20}
                  />
                ) : null}
              </span>
              <Typography
                className={slots.planDescription()}
                type="body-sm"
              >
                {plan.description}
              </Typography>
            </Button>
          );
        })}
      </div>
    </section>
  );
}
