"use client";

import { Typography } from "@heroui/react/typography";
import { Lock1 } from "@repo/icons/Lock1";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useProfileSettings } from "@/modules/account/lib/use-profile-settings";
import { ProfileSettingsAvatarSection } from "../../sections/ProfileSettingsAvatarSection";
import { ProfileSettingsFormSection } from "../../sections/ProfileSettingsFormSection";
import { profileSettingsScreenVariants } from "./ProfileSettingsScreen.styles";
import type { ProfileSettingsScreenProps } from "./ProfileSettingsScreen.types";
import { useRouter } from "@/shared/lib/app-router";

export function ProfileSettingsScreen({
  className,
  roleSegment = "athlete",
}: ProfileSettingsScreenProps) {
  const t = useTranslations("Mobile.ProfileSettings");
  const tProfile = useTranslations("Mobile.Profile");
  const styles = profileSettingsScreenVariants();
  const router = useRouter();
  const settings = useProfileSettings(roleSegment);

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.push(`/${roleSegment}/profile`)}
          title={t("title")}
        />
      }
    >
      <div className={styles.content()}>
        <ProfileSettingsAvatarSection
          alt={settings.displayName}
          isUploading={settings.isAvatarUploading}
          onPickFile={settings.uploadAvatar}
          src={settings.avatarSrc}
        />

        <ProfileSettingsFormSection
          error={settings.error}
          isPending={settings.isPending}
          nationalIdDisplay={settings.nationalIdDisplay}
          notice={settings.notice}
          onChange={settings.patchValues}
          onPatchAthlete={settings.patchAthlete}
          onPatchCoach={settings.patchCoach}
          onSubmit={() => {
            void settings.save();
          }}
          phoneDisplay={settings.phoneDisplay}
          provinces={settings.provinces}
          referralCodeDisplay={settings.referralCodeDisplay}
          values={settings.values}
        />

        <footer className={styles.privacy()}>
          <Lock1 aria-hidden className={styles.privacyIcon()} size={16} />
          <Typography className={styles.privacyText()} type="body-sm">
            {tProfile("privacyNote")}
          </Typography>
        </footer>
      </div>
    </AppLayout>
  );
}
