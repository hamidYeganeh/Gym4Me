import { Button, Input, Label, TextField, Typography } from "@heroui/react";
import { ArrowRight, ChevronLeft } from "@repo/icons";
import { kycStatusDetailsSectionVariants } from "./KycStatusDetailsSection.styles";
import type { KycStatusDetailsSectionProps } from "./KycStatusDetailsSection.types";

export function KycStatusDetailsSection({
  t,
  nationalId,
  setNationalId,
  birthDateJalali,
  setBirthDateJalali,
  error,
  isPending,
  handleDetails,
  goBack,
}: KycStatusDetailsSectionProps) {
  const styles = kycStatusDetailsSectionVariants();

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
        </TextField>
        <TextField
          className={styles.field()}
          fullWidth
          isRequired
          name="birthDate"
          value={birthDateJalali}
          onChange={setBirthDateJalali}
        >
          <Label className={styles.label()}>{t("birthDate")}</Label>
          <Input
            className={styles.input()}
            placeholder={t("birthDatePlaceholder")}
          />
        </TextField>

        {error ? (
          <p className={styles.error()} role="alert">
            {error}
          </p>
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
