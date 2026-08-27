"use client";

import { Bell1 } from "@repo/icons/Bell1";
import { BracketsCurly } from "@repo/icons/BracketsCurly";
import { Chat } from "@repo/icons/Chat";
import { CreditCard } from "@repo/icons/CreditCard";
import { Equalizer } from "@repo/icons/Equalizer";
import { Lock1 } from "@repo/icons/Lock1";
import { MapPin1 } from "@repo/icons/MapPin1";
import { Megaphone } from "@repo/icons/Megaphone";
import { Mobile } from "@repo/icons/Mobile";
import { QuestionMark } from "@repo/icons/QuestionMark";
import { Ruler1 } from "@repo/icons/Ruler1";
import { Sparkle1 } from "@repo/icons/Sparkle1";
import { Trash1 } from "@repo/icons/Trash1";
import { User } from "@repo/icons/User";
import { UserPlus } from "@repo/icons/UserPlus";
import { VolumeHigh } from "@repo/icons/VolumeHigh";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useMemo, type ReactNode } from "react";

export const PROFILE_ROW_ICON_SIZE = 22;

export type ProfileMenuItem = {
  key: string;
  icon: ReactNode;
  label: string;
  hint?: string;
  badge?: string | number;
  tone?: "default" | "danger";
  showChevron?: boolean;
  trailing?: ReactNode;
  isDisabled?: boolean;
  onPress?: () => void;
};

export type ProfileMenuGroup = {
  key: string;
  title: string;
  items: ProfileMenuItem[];
};

export function useProfileMenu({
  roleSegment,
  deviceSyncEnabled,
  soundTrailing,
}: {
  roleSegment: "athlete" | "coach" | "owner";
  deviceSyncEnabled: boolean;
  soundTrailing?: ReactNode;
}) {
  const t = useTranslations("Mobile.Profile");
  const router = useRouter();
  const icon = PROFILE_ROW_ICON_SIZE;

  return useMemo((): ProfileMenuGroup[] => {
    const path = (suffix: string) => `/${roleSegment}/profile/${suffix}`;
    const billingHref =
      roleSegment === "owner"
        ? "/owner/subscription"
        : roleSegment === "coach"
          ? "/coach/earnings"
          : null;

    const general: ProfileMenuItem[] = [
      {
        key: "profile",
        icon: <User size={icon} />,
        label: t("profileSettings"),
        onPress: () => router.push(path("edit")),
      },
      {
        key: "roles",
        icon: <UserPlus size={icon} />,
        label: t("applyRole"),
        hint: t("applyRoleHint"),
        onPress: () => router.push(path("roles")),
      },
      ...(roleSegment === "athlete" && deviceSyncEnabled
        ? [
            {
              key: "devices",
              icon: <Mobile size={icon} />,
              label: t("linkedDevices"),
              onPress: () => router.push("/athlete/health-sync"),
            } satisfies ProfileMenuItem,
          ]
        : []),
      ...(billingHref
        ? [
            {
              key: "billing",
              icon: <CreditCard size={icon} />,
              label: t("subscription"),
              onPress: () => router.push(billingHref),
            } satisfies ProfileMenuItem,
          ]
        : []),
      {
        key: "units",
        icon: <Ruler1 size={icon} />,
        label: t("unitsMetrics"),
        onPress: () => router.push(`/${roleSegment}/profile/settings/units`),
      },
      {
        key: "locations",
        icon: <MapPin1 size={icon} />,
        label: t("favouriteLocations"),
        onPress: () => router.push(path("locations")),
      },
      {
        key: "preferences",
        icon: <Equalizer size={icon} />,
        label: t("preferences"),
        onPress: () => router.push(`/${roleSegment}/settings`),
      },
    ];

    const notifications: ProfileMenuItem[] = [
      {
        key: "insight",
        icon: <Sparkle1 size={icon} />,
        label: t("insightUpdate"),
        onPress: () => router.push(`/${roleSegment}/notifications`),
      },
      {
        key: "general-notification",
        icon: <Bell1 size={icon} />,
        label: t("generalNotification"),
        onPress: () => router.push(path("notification-settings")),
      },
      {
        key: "sound-notification",
        icon: <VolumeHigh size={icon} />,
        label: t("soundNotification"),
        showChevron: !soundTrailing,
        trailing: soundTrailing,
        onPress: soundTrailing
          ? undefined
          : () => router.push(path("notification-settings")),
      },
    ];

    const security: ProfileMenuItem[] = [
      {
        key: "password",
        icon: <Lock1 size={icon} />,
        label: t("changePassword"),
        onPress: () => router.push(path("security/password")),
      },
    ];

    const help: ProfileMenuItem[] = [
      {
        key: "faq",
        icon: <QuestionMark size={icon} />,
        label: t("faqs"),
        onPress: () => router.push(path("help/faq")),
      },
      {
        key: "live-chat",
        icon: <Chat size={icon} />,
        label: t("liveChat"),
        hint: t("liveChatHint"),
        isDisabled: true,
        showChevron: false,
      },
      {
        key: "feature-request",
        icon: <BracketsCurly size={icon} />,
        label: t("featureRequest"),
        onPress: () => router.push(path("help/tickets")),
      },
      {
        key: "whats-new",
        icon: <Megaphone size={icon} />,
        label: t("whatsNew"),
        onPress: () => router.push(path("help")),
      },
    ];

    const danger: ProfileMenuItem[] = [
      {
        key: "delete-account",
        icon: <Trash1 size={icon} />,
        label: t("deleteAccount"),
        tone: "danger",
        onPress: () => {
          toast.info(t("deleteAccountSoon"));
        },
      },
    ];

    return [
      { key: "general", title: t("generalGroup"), items: general },
      { key: "notifications", title: t("notificationsGroup"), items: notifications },
      { key: "security", title: t("securityGroup"), items: security },
      { key: "help", title: t("helpGroup"), items: help },
      { key: "danger", title: t("dangerGroup"), items: danger },
    ];
  }, [deviceSyncEnabled, icon, roleSegment, router, soundTrailing, t]);
}
