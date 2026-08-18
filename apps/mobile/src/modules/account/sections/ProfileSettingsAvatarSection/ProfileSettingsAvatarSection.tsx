"use client";

import { useRef } from "react";
import { Avatar } from "@heroui/react/avatar";
import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Pencil1 } from "@repo/icons/Pencil1";
import { User } from "@repo/icons/User";
import { useTranslations } from "next-intl";
import { profileSettingsAvatarSectionVariants } from "./ProfileSettingsAvatarSection.styles";
import type { ProfileSettingsAvatarSectionProps } from "./ProfileSettingsAvatarSection.types";

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
const AVATAR_ICON = 40;

export function ProfileSettingsAvatarSection({
  src,
  alt,
  isUploading,
  onPickFile,
  className,
}: ProfileSettingsAvatarSectionProps) {
  const t = useTranslations("Mobile.Profile");
  const tSettings = useTranslations("Mobile.ProfileSettings");
  const styles = profileSettingsAvatarSectionVariants();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.root({ className })}>
      <Avatar className={styles.avatar()} color="accent">
        {src ? (
          <Avatar.Image alt={alt} className={styles.image()} src={src} />
        ) : null}
        <Avatar.Fallback className={styles.fallback()}>
          <User size={AVATAR_ICON} />
        </Avatar.Fallback>
      </Avatar>
      {isUploading ? (
        <div
          aria-label={tSettings("uploadingAvatar")}
          className={styles.overlay()}
          role="status"
        >
          <Spinner color="accent" size="sm" />
        </div>
      ) : null}
      <input
        accept={IMAGE_ACCEPT}
        className={styles.hiddenInput()}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onPickFile(file);
        }}
        ref={inputRef}
        type="file"
      />
      <Button
        aria-label={t("uploadAvatar")}
        className={styles.edit()}
        isDisabled={isUploading}
        isIconOnly
        onPress={() => inputRef.current?.click()}
        size="lg"
        variant="tertiary"
      >
        <Pencil1 size={14} />
      </Button>
    </div>
  );
}
