"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { CloseX } from "@repo/icons/CloseX";
import { formBannerVariants } from "./FormBanner.styles";
import type { FormBannerProps } from "./FormBanner.types";

export function FormBanner({
  children,
  className,
  tone = "danger",
  onDismiss,
  dismissLabel,
  role = tone === "danger" ? "alert" : "status",
}: FormBannerProps) {
  const styles = formBannerVariants({ tone });

  return (
    <div className={styles.root({ className })} role={role}>
      <Typography className={styles.message()} type="body-sm" weight="semibold">
        {children}
      </Typography>
      {onDismiss ? (
        <Button
          aria-label={dismissLabel}
          className={styles.dismiss()}
          isIconOnly
          size="lg"
          type="button"
          variant="ghost"
          onPress={onDismiss}
        >
          <CloseX size={18} />
        </Button>
      ) : null}
    </div>
  );
}
