"use client";

import { useState } from "react";
import { Button } from "@heroui/react/button";
import { Label } from "@heroui/react/label";
import { TextArea } from "@heroui/react/textarea";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { athleteSocialCreateScreenVariants } from "./AthleteSocialCreateScreen.styles";
import type { AthleteSocialCreateScreenProps } from "./AthleteSocialCreateScreen.types";

export function AthleteSocialCreateScreen({
  pending = false,
  error = false,
  onSubmit,
  className,
}: AthleteSocialCreateScreenProps) {
  const t = useTranslations("AthleteSocial");
  const styles = athleteSocialCreateScreenVariants();
  const router = useRouter();
  const [body, setBody] = useState("");

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          title={t("createTitle")}
        />
      }
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.introTitle()} type="h1" weight="bold">
            {t("createTitle")}
          </Typography>
          <Typography className={styles.introSubtitle()} type="body">
            {t("createSubtitle")}
          </Typography>
        </section>

        <div className={styles.form()}>
          <TextField>
            <Label>{t("bodyLabel")}</Label>
            <TextArea
              onChange={(event) => setBody(event.target.value)}
              placeholder={t("bodyPlaceholder")}
              rows={6}
              value={body}
            />
          </TextField>
          <Typography className={styles.hint()} type="body-sm">
            {t("mediaHint")}
          </Typography>
          {error ? (
            <Typography className={styles.error()} type="body-sm">
              {t("createError")}
            </Typography>
          ) : null}
          <Button
            fullWidth
            isDisabled={pending || body.trim().length === 0}
            onPress={() => void onSubmit(body)}
            variant="primary"
          >
            {t("publish")}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
