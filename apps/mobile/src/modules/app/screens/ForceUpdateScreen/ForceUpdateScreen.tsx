"use client";

import { Button, Typography } from "@heroui/react";
import { useTranslations } from "next-intl";
import { forceUpdateScreenVariants } from "./ForceUpdateScreen.styles";
import type { ForceUpdateScreenProps } from "./ForceUpdateScreen.types";

export function ForceUpdateScreen({
  currentVersion,
  minimumVersion,
  updateUrl,
  message,
  className,
}: ForceUpdateScreenProps) {
  const t = useTranslations("ForceUpdate");
  const styles = forceUpdateScreenVariants();

  return (
    <div className={styles.root({ className })}>
      <div className={styles.content()}>
        <Typography className={styles.title()} type="h1" weight="bold">
          {t("title")}
        </Typography>
        <Typography className={styles.body()} type="body">
          {message ?? t("body")}
        </Typography>
        <div className={styles.versions()}>
          <span>
            {t("currentVersion")}: {currentVersion}
          </span>
          <span>
            {t("minimumVersion")}: {minimumVersion}
          </span>
        </div>
        <div className={styles.actions()}>
          <Button
            fullWidth
            onPress={() => window.open(updateUrl, "_blank", "noopener,noreferrer")}
            size="lg"
            variant="primary"
          >
            {t("update")}
          </Button>
        </div>
      </div>
    </div>
  );
}
