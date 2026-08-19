"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { CloseX } from "@repo/icons/CloseX";
import { useTranslations } from "next-intl";
import { optionalUpdateBannerVariants } from "./OptionalUpdateBanner.styles";
import type { OptionalUpdateBannerProps } from "./OptionalUpdateBanner.types";

export function OptionalUpdateBanner({
  title,
  body,
  features,
  updateUrl,
  onUpdate,
  onDismiss,
  className,
}: OptionalUpdateBannerProps) {
  const t = useTranslations("OptionalUpdate");
  const styles = optionalUpdateBannerVariants();

  return (
    <div className={styles.root({ className })} role="status">
      <div className={styles.inner()}>
        <div className={styles.header()}>
          <div className="min-w-0 flex-1 space-y-1">
            <Typography className={styles.title()} type="body" weight="semibold">
              {title}
            </Typography>
            <Typography className={styles.body()} type="body">
              {body}
            </Typography>
          </div>
          <Button
            aria-label={t("dismiss")}
            isIconOnly
            size="lg"
            variant="ghost"
            onPress={onDismiss}
          >
            <CloseX size={20} />
          </Button>
        </div>
        {features.length > 0 ? (
          <ul className={styles.features()}>
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        ) : null}
        <div className={styles.actions()}>
          <Button
            isDisabled={!updateUrl}
            size="sm"
            variant="primary"
            onPress={onUpdate}
          >
            {t("update")}
          </Button>
          <Button size="sm" variant="tertiary" onPress={onDismiss}>
            {t("later")}
          </Button>
        </div>
      </div>
    </div>
  );
}
