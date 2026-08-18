"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { Plus } from "@repo/icons/Plus";
import { StickyBottomActions } from "@repo/ui/kit/StickyBottomActions";
import { useTranslations } from "next-intl";
import { discoveryCoachesSlotsFooterSectionVariants } from "./DiscoveryCoachesSlotsFooterSection.styles";
import type { DiscoveryCoachesSlotsFooterSectionProps } from "./DiscoveryCoachesSlotsFooterSection.types";

export function DiscoveryCoachesSlotsFooterSection({
  selectionSummary,
  canBook,
  onBook,
  className,
}: DiscoveryCoachesSlotsFooterSectionProps) {
  const t = useTranslations("CoachDetail");
  const styles = discoveryCoachesSlotsFooterSectionVariants();

  return (
    <StickyBottomActions contentClassName={styles.root({ className })}>
      <Typography className={styles.selectionSummary()} type="body-sm">
        {selectionSummary}
      </Typography>
      <Button
        className={styles.bookButton()}
        isDisabled={!canBook}
        onPress={onBook}
        size="lg"
      >
        <Typography className={styles.bookLabel()} weight="bold">
          {t("bookConsultation")}
        </Typography>
        <Plus aria-hidden className={styles.bookIcon()} size={20} />
      </Button>
    </StickyBottomActions>
  );
}
