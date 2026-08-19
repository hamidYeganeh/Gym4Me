"use client";

import { Bell1 } from "@repo/icons/Bell1";
import { BarbellHorizontal } from "@repo/icons/BarbellHorizontal";
import { Camera1 } from "@repo/icons/Camera1";
import { Chat } from "@repo/icons/Chat";
import { Gift } from "@repo/icons/Gift";
import { Globe } from "@repo/icons/Globe";
import { Headset1 } from "@repo/icons/Headset1";
import { HeartEcg } from "@repo/icons/HeartEcg";
import { InfoCircle } from "@repo/icons/InfoCircle";
import { Leaf } from "@repo/icons/Leaf";
import { Lock1 } from "@repo/icons/Lock1";
import { Moon } from "@repo/icons/Moon";
import { Pencil1 } from "@repo/icons/Pencil1";
import { PiggyBank } from "@repo/icons/PiggyBank";
import { QrCode } from "@repo/icons/QrCode";
import { Scan1 } from "@repo/icons/Scan1";
import { ShieldCheck } from "@repo/icons/ShieldCheck";
import { ShieldExclamationMark } from "@repo/icons/ShieldExclamationMark";
import { Trophy1 } from "@repo/icons/Trophy1";
import { UsersTwo } from "@repo/icons/UsersTwo";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, type ReactNode } from "react";

export const SETTINGS_ROW_ICON_SIZE = 20;

export type SettingsNavRow = {
  key: string;
  icon: ReactNode;
  label: string;
  hint?: string;
  onPress: () => void;
};

export function useSettingsNav(
  roleSegment: string,
  deviceSyncEnabled: boolean,
) {
  const t = useTranslations("Mobile.Settings");
  const router = useRouter();
  const icon = SETTINGS_ROW_ICON_SIZE;

  const allAccountRows = useMemo((): SettingsNavRow[] => {
    const athleteRows: SettingsNavRow[] =
      roleSegment === "athlete"
        ? [
            {
              key: "check-ins",
              icon: <Scan1 size={icon} />,
              label: t("checkIns"),
              hint: t("checkInsHint"),
              onPress: () => router.push("/athlete/check-ins"),
            },
            {
              key: "workouts",
              icon: <BarbellHorizontal size={icon} />,
              label: t("workouts"),
              hint: t("workoutsHint"),
              onPress: () => router.push("/athlete/workouts"),
            },
            {
              key: "social",
              icon: <Chat size={icon} />,
              label: t("social"),
              hint: t("socialHint"),
              onPress: () => router.push("/athlete/social"),
            },
            {
              key: "nutrition",
              icon: <Leaf size={icon} />,
              label: t("nutrition"),
              hint: t("nutritionHint"),
              onPress: () => router.push("/athlete/nutrition"),
            },
            {
              key: "data-grants",
              icon: <Lock1 size={icon} />,
              label: t("dataGrants"),
              hint: t("dataGrantsHint"),
              onPress: () => router.push("/athlete/data-grants"),
            },
            {
              key: "goals",
              icon: <Trophy1 size={icon} />,
              label: t("goals"),
              hint: t("goalsHint"),
              onPress: () => router.push("/athlete/goals"),
            },
            {
              key: "messages",
              icon: <Chat size={icon} />,
              label: t("messages"),
              hint: t("messagesHint"),
              onPress: () => router.push("/athlete/messages"),
            },
            {
              key: "progress-photos",
              icon: <Camera1 size={icon} />,
              label: t("progressPhotos"),
              hint: t("progressPhotosHint"),
              onPress: () => router.push("/athlete/progress-photos"),
            },
            {
              key: "health-assessment",
              icon: <HeartEcg size={icon} />,
              label: t("healthAssessment"),
              hint: t("healthAssessmentHint"),
              onPress: () => router.push("/athlete/health-assessment"),
            },
            {
              key: "qr-check-in",
              icon: <QrCode size={icon} />,
              label: t("qrCheckIn"),
              hint: t("qrCheckInHint"),
              onPress: () => router.push("/athlete/qr-check-in"),
            },
            {
              key: "subscription",
              icon: <PiggyBank size={icon} />,
              label: t("subscription"),
              hint: t("subscriptionHint"),
              onPress: () => router.push("/athlete/subscription"),
            },
            {
              key: "disputes",
              icon: <ShieldExclamationMark size={icon} />,
              label: t("disputes"),
              hint: t("disputesHint"),
              onPress: () => router.push("/athlete/disputes"),
            },
            {
              key: "family",
              icon: <UsersTwo size={icon} />,
              label: t("family"),
              hint: t("familyHint"),
              onPress: () => router.push("/athlete/family"),
            },
            {
              key: "passes",
              icon: <Gift size={icon} />,
              label: t("passes"),
              hint: t("passesHint"),
              onPress: () => router.push("/athlete/passes"),
            },
            {
              key: "data-rights",
              icon: <ShieldCheck size={icon} />,
              label: t("dataRights"),
              hint: t("dataRightsHint"),
              onPress: () => router.push("/athlete/data-rights"),
            },
            ...(deviceSyncEnabled
              ? [
                  {
                    key: "health-sync",
                    icon: <Scan1 size={icon} />,
                    label: t("healthSync"),
                    hint: t("healthSyncHint"),
                    onPress: () => router.push("/athlete/health-sync"),
                  } satisfies SettingsNavRow,
                ]
              : []),
            {
              key: "referral",
              icon: <Gift size={icon} />,
              label: t("referral"),
              hint: t("referralHint"),
              onPress: () => router.push("/athlete/referral"),
            },
          ]
        : [];

    return [
      {
        key: "profile",
        icon: <Pencil1 size={icon} />,
        label: t("editProfile"),
        hint: t("editProfileHint"),
        onPress: () => router.push(`/${roleSegment}/profile`),
      },
      {
        key: "kyc",
        icon: <ShieldCheck size={icon} />,
        label: t("kyc"),
        hint: t("kycHint"),
        onPress: () => router.push(`/${roleSegment}/kyc`),
      },
      {
        key: "roles",
        icon: <UsersTwo size={icon} />,
        label: t("roles"),
        hint: t("rolesHint"),
        onPress: () => router.push(`/${roleSegment}/profile/roles`),
      },
      {
        key: "achievements",
        icon: <Trophy1 size={icon} />,
        label: t("achievements"),
        hint: t("achievementsHint"),
        onPress: () => router.push(`/${roleSegment}/achievements`),
      },
      ...athleteRows,
    ];
  }, [deviceSyncEnabled, icon, roleSegment, router, t]);

  const rowsByKeys = (keys: string[]) =>
    allAccountRows.filter((row) => keys.includes(row.key));

  const supportRows: SettingsNavRow[] = useMemo(
    () => [
      {
        key: "support",
        icon: <Headset1 size={icon} />,
        label: t("support"),
        hint: t("supportHint"),
        onPress: () => {
          window.location.href = `tel:${t("supportPhone")}`;
        },
      },
    ],
    [icon, t],
  );

  return {
    t,
    accountRows: rowsByKeys(["profile", "kyc", "roles"]),
    activityRows: rowsByKeys([
      "achievements",
      "check-ins",
      "workouts",
      "goals",
      "progress-photos",
      "health-assessment",
      "health-sync",
      "nutrition",
    ]),
    serviceRows: rowsByKeys([
      "messages",
      "qr-check-in",
      "subscription",
      "disputes",
      "family",
      "passes",
      "referral",
      "social",
    ]),
    privacyRows: rowsByKeys(["data-grants", "data-rights"]),
    supportRows,
    preferenceIcons: {
      bell: <Bell1 size={icon} />,
      moon: <Moon size={icon} />,
      globe: <Globe size={icon} />,
      info: <InfoCircle size={icon} />,
    },
  };
}
