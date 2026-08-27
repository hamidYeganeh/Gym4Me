"use client";

import { useState } from "react";
import { Button } from "@heroui/react/button";
import { Door } from "@repo/icons/Door";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useRouter } from "@/shared/lib/app-router";

import { useSettingsNav } from "@/modules/account/lib/use-settings-nav";
import { ExitAppSheet } from "@/modules/app/components/ExitAppSheet";
import { SettingsNavGroupSection } from "@/modules/account/sections/SettingsNavGroupSection";
import { SettingsPreferencesSection } from "@/modules/account/sections/SettingsPreferencesSection";
import { SettingsSupportSection } from "@/modules/account/sections/SettingsSupportSection";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useFeatureFlag } from "@/shared/providers/AppConfigProvider";
import { SETTINGS_ROW_ICON_SIZE } from "@/modules/account/lib/use-settings-nav";
import { settingsScreenVariants } from "./SettingsScreen.styles";
import type { SettingsScreenProps } from "./SettingsScreen.types";

export function SettingsScreen({
  className,
  roleSegment = "athlete",
}: SettingsScreenProps) {
  const styles = settingsScreenVariants();
  const router = useRouter();
  const { logout } = useAuth();
  const deviceSyncEnabled = useFeatureFlag("health.device_sync");
  const nav = useSettingsNav(roleSegment, deviceSyncEnabled);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <SecondaryPageHeader
          backAriaLabel={nav.t("back")}
          onBack={() => router.back()}
          title={nav.t("title")}
        />
      }
    >
      <div className={styles.content()}>
        <SettingsNavGroupSection
          rows={nav.accountRows}
          title={nav.t("accountGroup")}
        />
        <SettingsNavGroupSection
          rows={nav.activityRows}
          title={nav.t("activityGroup")}
        />
        <SettingsNavGroupSection
          rows={nav.serviceRows}
          title={nav.t("servicesGroup")}
        />
        <SettingsNavGroupSection
          rows={nav.privacyRows}
          title={nav.t("privacyGroup")}
        />

        <SettingsPreferencesSection
          icons={nav.preferenceIcons}
          languageLabel={nav.t("language")}
          languageValue={nav.t("languageValue")}
          notificationsHint={nav.t("notificationsHint")}
          notificationsLabel={nav.t("notifications")}
          themeAriaLabel={nav.t("theme")}
          themeHint={nav.t("themeHint")}
          themeLabel={nav.t("theme")}
          title={nav.t("preferencesGroup")}
          onNotificationsPress={() =>
            router.push(`/${roleSegment}/profile/notification-settings`)
          }
        />

        <SettingsSupportSection
          aboutLabel={nav.t("about")}
          infoIcon={nav.preferenceIcons.info}
          supportRows={nav.supportRows}
          title={nav.t("supportGroup")}
          versionValue={nav.t("versionValue")}
        />

        <Button
          className={styles.logout()}
          fullWidth
          size="lg"
          variant="danger"
          onPress={() => {
            setLogoutConfirmOpen(true);
          }}
        >
          <Door size={SETTINGS_ROW_ICON_SIZE} />
          {nav.t("logout")}
        </Button>
      </div>

      <ExitAppSheet
        isOpen={logoutConfirmOpen}
        onLeave={() => {
          setLogoutConfirmOpen(false);
          void (async () => {
            await logout();
            router.replace("/auth");
          })();
        }}
        onOpenChange={setLogoutConfirmOpen}
        onStay={() => {
          setLogoutConfirmOpen(false);
        }}
      />
    </AppLayout>
  );
}
