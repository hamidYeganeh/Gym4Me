"use client";

import { Switch } from "@heroui/react/switch";
import type { GamificationSummary, MyAchievement } from "@repo/api";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { useThemeTransition } from "@repo/theme";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatMemberSince } from "@/modules/account/lib/profile-demographics";
import { useProfileMenu } from "@/modules/account/lib/use-profile-menu";
import { BaseProfileFooterSection } from "../../sections/BaseProfileFooterSection";
import { BaseProfileHeroSection } from "../../sections/BaseProfileHeroSection";
import { BaseProfileHighlightsSection } from "../../sections/BaseProfileHighlightsSection";
import { BaseProfileIdentitySection } from "../../sections/BaseProfileIdentitySection";
import { BaseProfileMenuSection } from "../../sections/BaseProfileMenuSection";
import {
  accountGamification,
  accountNotifications,
  mediaFileUrl,
} from "@/shared/lib/api";
import { useFeatureFlag } from "@/shared/providers/AppConfigProvider";
import { useAuth } from "@/shared/providers/AuthProvider";
import { baseProfileScreenVariants } from "./BaseProfileScreen.styles";
import type { BaseProfileScreenProps } from "./BaseProfileScreen.types";

export function BaseProfileScreen({
  className,
  roleSegment = "athlete",
}: BaseProfileScreenProps) {
  const t = useTranslations("Mobile.Profile");
  const tRole = useTranslations("Mobile.RoleApply");
  const styles = baseProfileScreenVariants();
  const router = useRouter();
  const { user, activeRole, logout } = useAuth();
  const { toggleThemeWithTransition } = useThemeTransition();
  const deviceSyncEnabled = useFeatureFlag("health.device_sync");

  const [summary, setSummary] = useState<GamificationSummary | null>(null);
  const [achievements, setAchievements] = useState<MyAchievement[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean | null>(null);
  const [soundPending, setSoundPending] = useState(false);

  const displayName = useMemo(() => {
    const parts = [user?.name.first, user?.name.last].filter(Boolean);
    if (parts.length > 0) return parts.join(" ");
    return user?.code ?? t("title");
  }, [t, user]);

  const activeRoleLabel = useMemo(() => {
    if (activeRole === "coach") return tRole("coach");
    if (activeRole === "club_owner") return tRole("owner");
    return tRole("athlete");
  }, [activeRole, tRole]);

  const memberSince = formatMemberSince(user?.createdAt);
  const avatarSrc = mediaFileUrl(user?.avatar.mediaId);

  useEffect(() => {
    let cancelled = false;
    void Promise.allSettled([
      accountGamification.summary(),
      accountGamification.achievements(),
      accountNotifications.getPreferences(),
    ]).then(([nextSummary, nextAchievements, nextPrefs]) => {
      if (cancelled) return;
      if (nextSummary.status === "fulfilled") {
        setSummary(nextSummary.value);
      }
      if (nextAchievements.status === "fulfilled") {
        setAchievements(nextAchievements.value);
      }
      if (nextPrefs.status === "fulfilled") {
        setSoundEnabled(nextPrefs.value.channels.push);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const onSoundChange = useCallback(async (value: boolean) => {
    setSoundEnabled(value);
    setSoundPending(true);
    try {
      const next = await accountNotifications.updatePreferences({
        channels: { push: value },
      });
      setSoundEnabled(next.channels.push);
    } catch {
      setSoundEnabled((current) => (current == null ? current : !value));
    } finally {
      setSoundPending(false);
    }
  }, []);

  const soundTrailing =
    soundEnabled == null ? undefined : (
      <Switch
        aria-label={t("soundNotification")}
        isDisabled={soundPending}
        isSelected={soundEnabled}
        onChange={(value) => {
          void onSoundChange(value);
        }}
        size="sm"
      >
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch>
    );

  const menuGroups = useProfileMenu({
    roleSegment,
    deviceSyncEnabled,
    soundTrailing,
  });

  const previewAchievements = useMemo(() => {
    const unlocked = achievements.filter((item) => item.state === "unlocked");
    return (unlocked.length > 0 ? unlocked : achievements).slice(0, 4);
  }, [achievements]);

  const inviteHref = roleSegment === "athlete" ? "/athlete/referral" : null;
  const streakHref =
    roleSegment === "athlete"
      ? "/athlete/check-ins"
      : `/${roleSegment}/achievements`;

  return (
    <AppLayout className={styles.root({ className })}>
      <div className={styles.content()}>
        <BaseProfileHeroSection
          avatarSrc={avatarSrc}
          displayName={displayName}
          roleSegment={roleSegment}
          onEditPress={() => router.push(`/${roleSegment}/profile/edit`)}
          onSettingsPress={() => router.push(`/${roleSegment}/settings`)}
          onThemePress={() => {
            void toggleThemeWithTransition();
          }}
        />

        <BaseProfileIdentitySection
          activeRoleLabel={activeRoleLabel}
          displayName={displayName}
          memberSince={memberSince}
        />

        <BaseProfileHighlightsSection
          achievements={previewAchievements}
          achievementsHref={`/${roleSegment}/achievements`}
          achievementsTotal={summary?.achievements.unlocked ?? 0}
          inviteHref={inviteHref}
          streakHref={streakHref}
        />

        <BaseProfileMenuSection groups={menuGroups} />

        <BaseProfileFooterSection
          onSignOut={async () => {
            await logout();
            router.replace("/auth");
          }}
        />
      </div>
    </AppLayout>
  );
}
