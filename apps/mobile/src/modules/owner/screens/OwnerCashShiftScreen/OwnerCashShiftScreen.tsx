"use client";

import {
  Button,
  Chip,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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
  className,
}: OwnerCashShiftScreenProps) {
  const t = useTranslations("OwnerCashShift");
  const router = useRouter();
  const styles = ownerCashShiftScreenVariants();

  return (
    <AppLayout
      className={[styles.root(), className].filter(Boolean).join(" ")}
      header={
        <Header
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
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
