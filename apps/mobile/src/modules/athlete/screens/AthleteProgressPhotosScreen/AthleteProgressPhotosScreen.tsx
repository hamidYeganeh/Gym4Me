"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { Camera1 } from "@repo/icons/Camera1";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Image1 } from "@repo/icons/Image1";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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
  onAddPhoto,
  className,
}: AthleteProgressPhotosScreenProps) {
  const t = useTranslations("AthleteProgressPhotos");
  const styles = athleteProgressPhotosScreenVariants();
  const router = useRouter();

  return (
    <AppLayout
      className={styles.root({ className })}
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

        <div className={styles.actions()}>
          <Button
            fullWidth
            isDisabled={pending || !onAddPhoto}
            onPress={() => void onAddPhoto?.()}
            variant="primary"
          >
            <Camera1 size={20} />
            {t("addPhoto")}
          </Button>
        </div>

        {photos.length === 0 ? (
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
                <div className={styles.thumb()} aria-hidden>
                  <Image1 size={32} />
                </div>
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
              </article>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
