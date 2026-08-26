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

import { ownerHolidaysScreenVariants } from "./OwnerHolidaysScreen.styles";
import type { OwnerHolidaysScreenProps } from "./OwnerHolidaysScreen.types";

export function OwnerHolidaysScreen({
  data,
  form,
  pending = false,
  onFormChange,
  onAddHoliday,
  onRemoveHoliday,
  pendingHolidayId,
  className,
}: OwnerHolidaysScreenProps) {
  const t = useTranslations("OwnerHolidays");
  const router = useRouter();
  const styles = ownerHolidaysScreenVariants();

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

        <section className={styles.formCard()}>
          <Typography type="body" weight="semibold">
            {t("addTitle")}
          </Typography>
          <TextField>
            <Label>{t("titleLabel")}</Label>
            <Input
              onChange={(event) => onFormChange({ title: event.target.value })}
              value={form.title}
            />
          </TextField>
          <TextField>
            <Label>{t("dateLabel")}</Label>
            <Input
              onChange={(event) =>
                onFormChange({ jalaliDate: event.target.value })
              }
              placeholder={t("datePlaceholder")}
              value={form.jalaliDate}
            />
          </TextField>
          <Button
            isDisabled={pending || !onAddHoliday || !form.title.trim() || !form.jalaliDate.trim()}
            isPending={pending}
            onPress={onAddHoliday}
            size="lg"
            variant="primary"
          >
            {t("addSubmit")}
          </Button>
        </section>

        <section className={styles.section()}>
          <Typography className={styles.sectionTitle()} type="h4" weight="semibold">
            {t("holidaysTitle")}
          </Typography>
          <div className={styles.card()}>
            {data.holidays.map((holiday, index) => (
              <div key={holiday.id}>
                <div className={styles.row()}>
                  <span className={styles.rowBody()}>
                    <Typography className={styles.rowLabel()} type="body" weight="semibold">
                      {holiday.title}
                    </Typography>
                    <Typography className={styles.rowHint()} type="body-sm">
                      {holiday.jalaliDateLabel}
                    </Typography>
                  </span>
                  <Chip color={holiday.isOfficial ? "accent" : "default"} size="sm" variant="soft">
                    <Chip.Label>
                      {holiday.isOfficial ? t("official") : t("custom")}
                    </Chip.Label>
                  </Chip>
                </div>
                {!holiday.isOfficial && onRemoveHoliday ? (
                  <div className="flex justify-end px-4 pb-3">
                    <Button
                      isDisabled={Boolean(pendingHolidayId)}
                      isPending={pendingHolidayId === holiday.id}
                      onPress={() => onRemoveHoliday(holiday.id)}
                      size="sm"
                      variant="secondary"
                    >
                      {t("remove")}
                    </Button>
                  </div>
                ) : null}
                {index < data.holidays.length - 1 ? (
                  <div aria-hidden className={styles.divider()} />
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section()}>
          <Typography className={styles.sectionTitle()} type="h4" weight="semibold">
            {t("programsTitle")}
          </Typography>
          {data.programs.length === 0 ? (
            <div className={styles.empty()}>{t("programsEmpty")}</div>
          ) : (
            <div className={styles.card()}>
              {data.programs.map((program, index) => (
                <div key={program.id}>
                  <div className={styles.row()}>
                    <span className={styles.rowBody()}>
                      <Typography className={styles.rowLabel()} type="body" weight="semibold">
                        {program.title}
                      </Typography>
                      <Typography className={styles.rowHint()} type="body-sm">
                        {program.jalaliDateLabel}
                      </Typography>
                      <Typography className={styles.rowHint()} type="body-sm">
                        {program.description}
                      </Typography>
                    </span>
                  </div>
                  {index < data.programs.length - 1 ? (
                    <div aria-hidden className={styles.divider()} />
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
