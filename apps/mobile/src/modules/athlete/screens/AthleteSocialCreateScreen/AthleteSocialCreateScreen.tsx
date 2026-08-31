"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );

  useEffect(
    () => () => {
      for (const preview of previews) URL.revokeObjectURL(preview.url);
    },
    [previews],
  );

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
          <input
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp"
            aria-label={t("selectMedia")}
            className="sr-only"
            disabled={pending || files.length >= 4}
            multiple
            onChange={(event) => {
              const selected = Array.from(event.target.files ?? []);
              event.target.value = "";
              setFiles((current) => [...current, ...selected].slice(0, 4));
            }}
            type="file"
          />
          <Button
            isDisabled={pending || files.length >= 4}
            onPress={() => fileInputRef.current?.click()}
            size="lg"
            variant="secondary"
          >
            {t("addMedia", { count: files.length })}
          </Button>
          <Typography className={styles.hint()} type="body-sm">
            {t("mediaHint")}
          </Typography>
          {previews.length > 0 ? (
            <div className={styles.mediaGrid()}>
              {previews.map(({ file, url }, index) => (
                <div className={styles.mediaItem()} key={`${file.name}-${index}`}>
                  <img
                    alt={t("mediaPreviewAlt", { index: index + 1 })}
                    className={styles.mediaImage()}
                    src={url}
                  />
                  <Button
                    aria-label={t("removeMedia", { index: index + 1 })}
                    className="absolute end-2 top-2"
                    isDisabled={pending}
                    isIconOnly
                    onPress={() =>
                      setFiles((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    size="lg"
                    variant="danger"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
          {error ? (
            <Typography className={styles.error()} type="body-sm">
              {t("createError")}
            </Typography>
          ) : null}
          <Button size="lg"
            fullWidth
            isDisabled={pending || body.trim().length === 0}
            onPress={() => void onSubmit(body, files)}
            variant="primary"
          >
            {t("publish")}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
