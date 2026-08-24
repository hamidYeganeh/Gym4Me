import { useState } from "react";
import { Button } from "@heroui/react/button";
import { DatePicker } from "@heroui/react/date-picker";
import { FieldError } from "@heroui/react/field-error";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { JalaliCalendar } from "@/shared/components/JalaliCalendar";
import { kycStatusDetailsSectionVariants } from "./KycStatusDetailsSection.styles";
import type { KycStatusDetailsSectionProps } from "./KycStatusDetailsSection.types";

export function KycStatusDetailsSection({
  t,
  nationalId,
  setNationalId,
  nationalIdError,
  birthDateJalali,
  setBirthDateJalali,
  birthDateError,
  error,
  isPending,
  handleDetails,
  goBack,
}: KycStatusDetailsSectionProps) {
  const styles = kycStatusDetailsSectionVariants();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  return (
    <>
      <div className={styles.topBar()}>
        <Button
          aria-label={t("back")}
          className={styles.backButton()}
          isIconOnly
          size="lg"
          type="button"
          variant="ghost"
          onPress={goBack}
        >
          <ChevronLeft size={22} />
        </Button>
      </div>

      <header className={styles.header()}>
        <Typography className={styles.title()} type="h1" weight="bold">
          {t("details.title")}
        </Typography>
        <Typography className={styles.subtitle()} color="muted">
          {t("details.subtitle")}
        </Typography>
      </header>

      <form className={styles.form()} onSubmit={handleDetails}>
        <TextField
          className={styles.field()}
          fullWidth
          isInvalid={Boolean(nationalIdError)}
          isRequired
          name="nationalId"
          value={nationalId}
          onChange={setNationalId}
        >
          <Label className={styles.label()}>{t("nationalId")}</Label>
          <Input
            className={styles.input()}
            inputMode="numeric"
            maxLength={10}
            placeholder={t("nationalIdPlaceholder")}
          />
          <FieldError className={styles.fieldError()}>
            {nationalIdError}
          </FieldError>
        </TextField>
        <DatePicker
          aria-label={t("birthDate")}
          className={styles.field()}
          isOpen={isDatePickerOpen}
          isInvalid={Boolean(birthDateError)}
          isRequired
          name="birthDate"
          onOpenChange={setIsDatePickerOpen}
        >
          <Label className={styles.label()}>{t("birthDate")}</Label>
          <DatePicker.Trigger className={styles.dateTrigger()}>
            <span
              className={styles.dateValue()}
              data-placeholder={!birthDateJalali || undefined}
            >
              {birthDateJalali || t("birthDatePlaceholder")}
            </span>
            <DatePicker.TriggerIndicator className={styles.dateIndicator()} />
          </DatePicker.Trigger>
          <FieldError className={styles.fieldError()}>
            {birthDateError}
          </FieldError>
          <DatePicker.Popover className={styles.datePopover()}>
            <JalaliCalendar
              aria-label={t("birthDate")}
              maxDate={new Date()}
              value={birthDateJalali}
              onChange={(next) => {
                setBirthDateJalali(
                  `${next.year}/${String(next.month).padStart(2, "0")}/${String(next.day).padStart(2, "0")}`,
                );
                setIsDatePickerOpen(false);
              }}
            />
          </DatePicker.Popover>
        </DatePicker>

        {error ? (
          <Typography className={styles.error()} role="alert" type="body-sm">
            {error}
          </Typography>
        ) : null}

        <div className={styles.spacer()} aria-hidden />

        <div className={styles.actions()}>
          <Button
            className={styles.primary()}
            fullWidth
            isPending={isPending}
            size="lg"
            type="submit"
            variant="primary"
          >
            {t("details.continue")}
            <ArrowRight className={styles.primaryIcon()} size={20} />
          </Button>
        </div>
      </form>
    </>
  );
}
