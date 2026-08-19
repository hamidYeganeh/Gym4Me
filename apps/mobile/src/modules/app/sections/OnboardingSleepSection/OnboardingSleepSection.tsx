"use client";

import type { Key } from "@heroui/react/rac";
import NumberFlow from "@number-flow/react";
import { Tabs } from "@heroui/react/tabs";
import { Typography } from "@heroui/react/typography";
import type { OnboardingSleepLevel } from "@/modules/app/lib/onboarding-data";
import { onboardingSleepSectionVariants } from "./OnboardingSleepSection.styles";
import type { OnboardingSleepSectionProps } from "./OnboardingSleepSection.types";

export function OnboardingSleepSection({
  options,
  value,
  onChange,
  tabsLabel,
  className,
}: OnboardingSleepSectionProps) {
  const styles = onboardingSleepSectionVariants();
  const current = options.find((option) => option.level === value) ?? options[0];

  return (
    <div className={styles.root({ className })}>
      <div className={styles.valueStack()}>
        <NumberFlow
          className={styles.value()}
          locales="en-US"
          style={{ color: "var(--foreground)" }}
          value={value}
        />
        {current ? (
          <Typography className={styles.label()}>{current.label}</Typography>
        ) : null}
      </div>

      <Tabs
        className={styles.tabs()}
        selectedKey={String(value)}
        onSelectionChange={(key: Key) => {
          const next = Number(key);
          if (next >= 1 && next <= 5) {
            onChange(next as OnboardingSleepLevel);
          }
        }}
      >
        <Tabs.ListContainer className={styles.tabsListContainer()}>
          <Tabs.List aria-label={tabsLabel} className={styles.tabsList()}>
            {options.map((option) => (
              <Tabs.Tab
                className={styles.tab()}
                id={String(option.level)}
                key={option.level}
              >
                {option.level}
                <Tabs.Indicator className={styles.tabIndicator()} />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
        {options.map((option) => (
          <Tabs.Panel
            className="hidden"
            id={String(option.level)}
            key={option.level}
          >
            {null}
          </Tabs.Panel>
        ))}
      </Tabs>

      {current ? (
        <Typography className={styles.description()}>
          {current.description}
        </Typography>
      ) : null}
    </div>
  );
}
