"use client";

import { useRef } from "react";
import { Button } from "@heroui/react/button";
import { ProgressCircle } from "@heroui/react/progress-circle";
import { Typography } from "@heroui/react/typography";
import { ArrowUpload } from "@repo/icons/ArrowUpload";
import { User } from "@repo/icons/User";
import Image from "next/image";
import {
  ImageCropperSheet,
  useImageCropper,
} from "@/shared/components/ImageCropperSheet";
import { onboardingAvatarSectionVariants } from "./OnboardingAvatarSection.styles";
import type { OnboardingAvatarSectionProps } from "./OnboardingAvatarSection.types";

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

export function OnboardingAvatarSection({
  value,
  labels,
  onUpload,
  className,
}: OnboardingAvatarSectionProps) {
  const styles = onboardingAvatarSectionVariants();
  const inputRef = useRef<HTMLInputElement>(null);
  const { cropImage, cropperProps } = useImageCropper();

  if (value.mode === "uploading") {
    return (
      <div className={styles.root({ className })}>
        <div className={styles.uploading()}>
          <ProgressCircle
            aria-label={labels.uploading}
            className={styles.progress()}
            color="accent"
            size="lg"
            value={value.progress}
          >
            <ProgressCircle.Track>
              <ProgressCircle.TrackCircle className={styles.track()} />
              <ProgressCircle.FillCircle className={styles.fill()} />
            </ProgressCircle.Track>
          </ProgressCircle>
          <Typography className={styles.uploadingTitle()} weight="bold">
            {labels.uploading}
          </Typography>
          <Typography className={styles.fileName()}>
            {value.fileName}
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root({ className })}>
      <Typography className={styles.title()} type="h1" weight="bold">
        {labels.title}
      </Typography>

      <div className={styles.preview()}>
        {value.previewUrl ? (
          <Image
            alt=""
            className={styles.previewImage()}
            fill
            sizes="176px"
            src={value.previewUrl}
          />
        ) : (
          <User aria-hidden className={styles.previewIcon()} size={80} />
        )}
      </div>

      <div className={styles.actions()}>
        <input
          accept={IMAGE_ACCEPT}
          className={styles.hiddenInput()}
          ref={inputRef}
          type="file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) {
              void cropImage(file, 1).then((cropped) => {
                if (cropped) onUpload(cropped);
              });
            }
          }}
        />
        <Button
          className={styles.uploadBtn()}
          fullWidth
          size="lg"
          variant="primary"
          onPress={() => inputRef.current?.click()}
        >
          {labels.upload}
          <ArrowUpload aria-hidden className={styles.uploadIcon()} size={20} />
        </Button>
      </div>
      <ImageCropperSheet {...cropperProps} />
    </div>
  );
}
