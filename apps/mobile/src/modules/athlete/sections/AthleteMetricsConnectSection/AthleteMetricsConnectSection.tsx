"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { SmartWatchPlus } from "@repo/icons/SmartWatchPlus";
import { athleteMetricsConnectSectionStyles as styles } from "./AthleteMetricsConnectSection.styles";
import type { AthleteMetricsConnectSectionProps } from "./AthleteMetricsConnectSection.types";

export function AthleteMetricsConnectSection({
  title,
  subtitle,
  actionLabel,
  connectingLabel,
  connectedLabel,
  unsupportedLabel,
  errorLabel,
  deniedLabel,
  status,
  onConnect,
  onOpenSettings,
  settingsLabel,
}: AthleteMetricsConnectSectionProps) {
  if (status === "unsupported") {
    return (
      <section className={styles.root}>
        <div className={styles.card}>
          <div aria-hidden className={styles.iconWrap}>
            <SmartWatchPlus size={22} />
          </div>
          <div className={styles.content}>
            <Typography className={styles.title} type="body" weight="bold">
              {title}
            </Typography>
            <Typography className={styles.subtitle} type="body-sm">
              {unsupportedLabel}
            </Typography>
          </div>
        </div>
      </section>
    );
  }

  const isBusy = status === "checking" || status === "connecting";
  const isConnected = status === "connected";
  const showDenied = status === "denied";
  const showError = status === "error";

  let statusText: string | null = null;
  if (isConnected) statusText = connectedLabel;
  else if (showDenied) statusText = deniedLabel;
  else if (showError) statusText = errorLabel;

  return (
    <section className={styles.root}>
      <div className={styles.card}>
        <div aria-hidden className={styles.iconWrap}>
          <SmartWatchPlus size={22} />
        </div>

        <div className={styles.content}>
          <Typography className={styles.title} type="body" weight="bold">
            {title}
          </Typography>
          <Typography className={styles.subtitle} type="body-sm">
            {subtitle}
          </Typography>
          {statusText ? (
            <Chip
              className={styles.statusChip}
              color={isConnected ? "success" : "warning"}
              size="sm"
              variant="soft"
            >
              <Chip.Label>{statusText}</Chip.Label>
            </Chip>
          ) : null}
        </div>

        <div className={styles.actions}>
          <Button
            isPending={isBusy}
            onPress={onConnect}
            size="md"
            variant={isConnected ? "secondary" : "primary"}
          >
            {({ isPending }) => (
              <>
                {isPending ? <Spinner color="current" size="sm" /> : null}
                {isPending ? connectingLabel : actionLabel}
              </>
            )}
          </Button>
          {showDenied && onOpenSettings && settingsLabel ? (
            <Button onPress={onOpenSettings} size="sm" variant="ghost">
              {settingsLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
