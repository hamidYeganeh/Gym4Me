"use client";

import { Controller } from "react-hook-form";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextArea } from "@heroui/react/textarea";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { ownerClubsCreateIdentitySectionVariants } from "./OwnerClubsCreateIdentitySection.styles";
import type { OwnerClubsCreateIdentitySectionProps } from "./OwnerClubsCreateIdentitySection.types";

export function OwnerClubsCreateIdentitySection({
  control,
  className,
}: OwnerClubsCreateIdentitySectionProps) {
  const t = useTranslations("Mobile.ClubCreate");
  const styles = ownerClubsCreateIdentitySectionVariants();

  return (
    <section className={styles.root({ className })}>
      <div className={styles.header()}>
        <Typography className={styles.title()} type="h4" weight="bold">
          {t("stepIdentity")}
        </Typography>
        <Typography className={styles.hint()} type="body-sm">
          {t("stepIdentityHint")}
        </Typography>
      </div>

      <div className={styles.form()}>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <TextField
              className={styles.field()}
              fullWidth
              isRequired
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              <Label>{t("name")}</Label>
              <Input placeholder={t("namePlaceholder")} ref={field.ref} />
            </TextField>
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <TextField
              className={styles.field()}
              fullWidth
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              <Label>{t("description")}</Label>
              <TextArea
                placeholder={t("descriptionPlaceholder")}
                ref={field.ref}
                rows={4}
              />
            </TextField>
          )}
        />
      </div>
    </section>
  );
}
