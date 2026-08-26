"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import type { OwnerCashChannel } from "../../lib/owner-cash-shift-data";
import { ownerCashShiftScreenVariants } from "./OwnerCashShiftScreen.styles";
import type { OwnerCashShiftScreenProps } from "./OwnerCashShiftScreen.types";

const CHANNEL_LABEL_KEY: Record<
  OwnerCashChannel,
  "channelCash" | "channelPos" | "channelCard" | "channelGateway"
> = {
  cash: "channelCash",
  pos: "channelPos",
  card_to_card: "channelCard",
  gateway: "channelGateway",
};

export function OwnerCashShiftScreen({
  shift,
  countedByChannel,
  discrepancyReason,
  pending = false,
  onCountedChange,
  onDiscrepancyChange,
  onClose,
  onOpen,
  className,
}: OwnerCashShiftScreenProps) {
  const t = useTranslations("OwnerCashShift");
  const router = useRouter();
  const styles = ownerCashShiftScreenVariants();

  return (
    <AppLayout
      className={[styles.root(), className].filter(Boolean).join(" ")}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
        />
      }
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.introTitle()} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle()} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        <section className={styles.hero()}>
          <div className="flex items-center justify-between gap-2">
            <Typography className={styles.heroLabel()} type="body-sm">
              {t("shiftStatus")}
            </Typography>
            <Chip
              color={shift.status === "open" ? "warning" : "success"}
              size="sm"
              variant="soft"
            >
              <Chip.Label>
                {shift.status === "open" ? t("statusOpen") : t("statusClosed")}
              </Chip.Label>
            </Chip>
          </div>
          <Typography className={styles.heroValue()} type="body-sm">
            {t("openedAt", {
              date: shift.openedAtLabel,
              by: shift.openedByLabel,
            })}
          </Typography>
          <Typography className={styles.heroValue()} type="h3" weight="bold">
            {shift.totalExpectedLabel}
          </Typography>
          <Typography className={styles.heroLabel()} type="body-sm">
            {t("totalExpected")}
          </Typography>
        </section>

        {shift.status === "closed" && onOpen ? (
          <div className={styles.actions()}>
            <Button
              isDisabled={pending}
              isPending={pending}
              onPress={onOpen}
              size="lg"
              variant="primary"
            >
              {t("openShift")}
            </Button>
          </div>
        ) : null}

        <section className={styles.section()}>
          <Typography className={styles.sectionTitle()} type="h4" weight="semibold">
            {t("channelsTitle")}
          </Typography>
          <div className={styles.card()}>
            {shift.channels.map((row, index) => (
              <div key={row.channel}>
                <div className={styles.row()}>
                  <span className={styles.rowBody()}>
                    <Typography
                      className={styles.rowLabel()}
                      type="body"
                      weight="medium"
                    >
                      {t(CHANNEL_LABEL_KEY[row.channel])}
                    </Typography>
                    <Typography className={styles.rowHint()} type="body-sm">
                      {t("expected")}: {row.expectedLabel}
                    </Typography>
                  </span>
                </div>
                {shift.status === "open" ? (
                  <div className="px-4 pb-3">
                    <TextField>
                      <Label>{t("counted")}</Label>
                      <Input
                        inputMode="numeric"
                        onChange={(event) =>
                          onCountedChange(row.channel, event.target.value)
                        }
                        placeholder={row.expectedLabel}
                        value={countedByChannel[row.channel] ?? ""}
                      />
                    </TextField>
                  </div>
                ) : (
                  <div className={styles.row()}>
                    <Typography className={styles.rowHint()} type="body-sm">
                      {t("counted")}
                    </Typography>
                    <span className={styles.rowValue()}>{row.countedLabel}</span>
                  </div>
                )}
                {index < shift.channels.length - 1 ? (
                  <div aria-hidden className={styles.divider()} />
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {shift.status === "open" ? (
          <section className={styles.formCard()}>
            <TextField>
              <Label>{t("discrepancyReason")}</Label>
              <Input
                onChange={(event) => onDiscrepancyChange(event.target.value)}
                placeholder={t("discrepancyPlaceholder")}
                value={discrepancyReason}
              />
            </TextField>
            <div className={styles.actions()}>
              <Button
                isDisabled={pending || !onClose}
                isPending={pending}
                onPress={onClose}
                size="lg"
                variant="primary"
              >
                {t("closeShift")}
              </Button>
            </div>
          </section>
        ) : null}
      </div>
    </AppLayout>
  );
}
