"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Label, ListBox, Select } from "@heroui/react";
import { Typography } from "@heroui/react/typography";
import { Camera1 } from "@repo/icons/Camera1";
import { Image1 } from "@repo/icons/Image1";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRef, type Key } from "react";
import { useRouter } from "@/shared/lib/app-router";

import type { ProgressPhotoPrivacy } from "../../lib/progress-photos-data";
import { athleteProgressPhotosScreenVariants } from "./AthleteProgressPhotosScreen.styles";
import type { AthleteProgressPhotosScreenProps } from "./AthleteProgressPhotosScreen.types";

function privacyLabel(
  t: ReturnType<typeof useTranslations<"AthleteProgressPhotos">>,
  privacy: ProgressPhotoPrivacy,
) {
  switch (privacy) {
    case "private":
      return t("privacyPrivate");
    case "coach_only":
      return t("privacyCoachOnly");
    case "followers":
      return t("privacyFollowers");
    case "public":
      return t("privacyPublic");
    default:
      return privacy;
  }
}

export function AthleteProgressPhotosScreen({
  photos,
  pending = false,
  loading = false,
  error = false,
  onAddPhoto,
  onDeletePhoto,
  onPrivacyChange,
  pendingPhotoId,
  onRetry,
  className,
}: AthleteProgressPhotosScreenProps) {
  const t = useTranslations("AthleteProgressPhotos");
  const styles = athleteProgressPhotosScreenVariants();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <AppLayout
      className={styles.root({ className })}
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

        <div className={styles.actions()}>
          <input
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp"
            aria-label={t("selectPhoto")}
            className="sr-only"
            disabled={pending || !onAddPhoto}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void onAddPhoto?.(file);
            }}
            type="file"
          />
          <Button
            fullWidth
            isDisabled={pending || !onAddPhoto}
            onPress={() => fileInputRef.current?.click()}
            variant="primary"
          >
            <Camera1 size={20} />
            {t("addPhoto")}
          </Button>
          {error ? (
            <div aria-live="polite">
              <Typography className={styles.error()} type="body-sm">
                {t("uploadError")}
              </Typography>
              {onRetry ? (
                <Button onPress={() => void onRetry()} variant="secondary">
                  {t("retry")}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        {loading ? (
          <div aria-label={t("loading")} className={styles.grid()}>
            {[0, 1, 2, 3].map((item) => (
              <div className={styles.skeleton()} key={item} />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className={styles.empty()}>
            <Typography type="h4" weight="semibold">
              {t("emptyTitle")}
            </Typography>
            <Typography className={styles.meta()} type="body-sm">
              {t("emptyBody")}
            </Typography>
          </div>
        ) : (
          <div className={styles.grid()}>
            {photos.map((photo) => (
              <article className={styles.card()} key={photo.id}>
                {photo.imageUrl ? (
                  <img
                    alt={t("photoAlt", { date: photo.takenAtLabel })}
                    className={styles.image()}
                    loading="lazy"
                    src={photo.imageUrl}
                  />
                ) : (
                  <div className={styles.thumb()} aria-hidden>
                    <Image1 size={32} />
                  </div>
                )}
                <Typography type="body-sm" weight="semibold">
                  {photo.takenAtLabel}
                </Typography>
                {photo.note ? (
                  <Typography className={styles.meta()} type="body-sm">
                    {photo.note}
                  </Typography>
                ) : null}
                <Chip size="sm" variant="soft">
                  <Chip.Label>{privacyLabel(t, photo.privacy)}</Chip.Label>
                </Chip>
                <div className={styles.cardActions()}>
                  <Select
                    aria-label={t("privacyLabel")}
                    isDisabled={pendingPhotoId === photo.id || !onPrivacyChange}
                    value={photo.privacy}
                    variant="secondary"
                    onChange={(value: Key | null) => {
                      if (value) {
                        void onPrivacyChange?.(
                          photo.id,
                          String(value) as ProgressPhotoPrivacy,
                        );
                      }
                    }}
                  >
                    <Label>{t("privacyLabel")}</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {(
                          [
                            "private",
                            "coach_only",
                            "followers",
                            "public",
                          ] as ProgressPhotoPrivacy[]
                        ).map((privacy) => (
                          <ListBox.Item
                            id={privacy}
                            key={privacy}
                            textValue={privacyLabel(t, privacy)}
                          >
                            {privacyLabel(t, privacy)}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  <Button
                    fullWidth
                    isDisabled={pendingPhotoId === photo.id || !onDeletePhoto}
                    onPress={() => {
                      if (window.confirm(t("deleteConfirm"))) {
                        void onDeletePhoto?.(photo.id);
                      }
                    }}
                    variant="danger"
                  >
                    {t("deletePhoto")}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
