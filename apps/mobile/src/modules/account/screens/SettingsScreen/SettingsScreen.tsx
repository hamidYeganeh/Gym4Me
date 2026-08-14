"use client";

import { Button, Typography } from "@heroui/react";
import { Bell1 } from "@repo/icons/Bell1";
import { BarbellHorizontal } from "@repo/icons/BarbellHorizontal";
import { Camera1 } from "@repo/icons/Camera1";
import { Chat } from "@repo/icons/Chat";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { Door } from "@repo/icons/Door";
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
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { AnimatedThemeToggler } from "@/shared/components/animated-theme-toggler";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useFeatureFlag } from "@/shared/providers/AppConfigProvider";
import { settingsScreenVariants } from "./SettingsScreen.styles";
import type { SettingsScreenProps } from "./SettingsScreen.types";

const ROW_ICON_SIZE = 20;

type NavRow = {
  key: string;
  icon: ReactNode;
  label: string;
  hint?: string;
  onPress: () => void;
};

export function SettingsScreen({
  className,
  roleSegment = "athlete",
}: SettingsScreenProps) {
  const t = useTranslations("Mobile.Settings");
  const styles = settingsScreenVariants();
  const router = useRouter();
  const { logout } = useAuth();
  const deviceSyncEnabled = useFeatureFlag("health.device_sync");

  const allAccountRows: NavRow[] = [
    {
      key: "profile",
      icon: <Pencil1 size={ROW_ICON_SIZE} />,
      label: t("editProfile"),
      hint: t("editProfileHint"),
      onPress: () => router.push(`/${roleSegment}/profile`),
    },
    {
      key: "kyc",
      icon: <ShieldCheck size={ROW_ICON_SIZE} />,
      label: t("kyc"),
      hint: t("kycHint"),
      onPress: () => router.push(`/${roleSegment}/kyc`),
    },
    {
      key: "roles",
      icon: <UsersTwo size={ROW_ICON_SIZE} />,
      label: t("roles"),
      hint: t("rolesHint"),
      onPress: () => router.push(`/${roleSegment}/roles`),
    },
    {
      key: "achievements",
      icon: <Trophy1 size={ROW_ICON_SIZE} />,
      label: t("achievements"),
      hint: t("achievementsHint"),
      onPress: () => router.push(`/${roleSegment}/achievements`),
    },
    ...(roleSegment === "athlete"
      ? [
          {
            key: "check-ins",
            icon: <Scan1 size={ROW_ICON_SIZE} />,
            label: t("checkIns"),
            hint: t("checkInsHint"),
            onPress: () => router.push("/athlete/check-ins"),
          },
          {
            key: "workouts",
            icon: <BarbellHorizontal size={ROW_ICON_SIZE} />,
            label: t("workouts"),
            hint: t("workoutsHint"),
            onPress: () => router.push("/athlete/workouts"),
          },
          {
            key: "social",
            icon: <Chat size={ROW_ICON_SIZE} />,
            label: t("social"),
            hint: t("socialHint"),
            onPress: () => router.push("/athlete/social"),
          },
          {
            key: "nutrition",
            icon: <Leaf size={ROW_ICON_SIZE} />,
            label: t("nutrition"),
            hint: t("nutritionHint"),
            onPress: () => router.push("/athlete/nutrition"),
          },
          {
            key: "data-grants",
            icon: <Lock1 size={ROW_ICON_SIZE} />,
            label: t("dataGrants"),
            hint: t("dataGrantsHint"),
            onPress: () => router.push("/athlete/data-grants"),
          },
          {
            key: "goals",
            icon: <Trophy1 size={ROW_ICON_SIZE} />,
            label: t("goals"),
            hint: t("goalsHint"),
            onPress: () => router.push("/athlete/goals"),
          },
          {
            key: "messages",
            icon: <Chat size={ROW_ICON_SIZE} />,
            label: t("messages"),
            hint: t("messagesHint"),
            onPress: () => router.push("/athlete/messages"),
          },
          {
            key: "progress-photos",
            icon: <Camera1 size={ROW_ICON_SIZE} />,
            label: t("progressPhotos"),
            hint: t("progressPhotosHint"),
            onPress: () => router.push("/athlete/progress-photos"),
          },
          {
            key: "health-assessment",
            icon: <HeartEcg size={ROW_ICON_SIZE} />,
            label: t("healthAssessment"),
            hint: t("healthAssessmentHint"),
            onPress: () => router.push("/athlete/health-assessment"),
          },
          {
            key: "qr-check-in",
            icon: <QrCode size={ROW_ICON_SIZE} />,
            label: t("qrCheckIn"),
            hint: t("qrCheckInHint"),
            onPress: () => router.push("/athlete/qr-check-in"),
          },
          {
            key: "subscription",
            icon: <PiggyBank size={ROW_ICON_SIZE} />,
            label: t("subscription"),
            hint: t("subscriptionHint"),
            onPress: () => router.push("/athlete/subscription"),
          },
          {
            key: "disputes",
            icon: <ShieldExclamationMark size={ROW_ICON_SIZE} />,
            label: t("disputes"),
            hint: t("disputesHint"),
            onPress: () => router.push("/athlete/disputes"),
          },
          {
            key: "family",
            icon: <UsersTwo size={ROW_ICON_SIZE} />,
            label: t("family"),
            hint: t("familyHint"),
            onPress: () => router.push("/athlete/family"),
          },
          {
            key: "passes",
            icon: <Gift size={ROW_ICON_SIZE} />,
            label: t("passes"),
            hint: t("passesHint"),
            onPress: () => router.push("/athlete/passes"),
          },
          {
            key: "data-rights",
            icon: <ShieldCheck size={ROW_ICON_SIZE} />,
            label: t("dataRights"),
            hint: t("dataRightsHint"),
            onPress: () => router.push("/athlete/data-rights"),
          },
          ...(deviceSyncEnabled
            ? [
                {
                  key: "health-sync",
                  icon: <Scan1 size={ROW_ICON_SIZE} />,
                  label: t("healthSync"),
                  hint: t("healthSyncHint"),
                  onPress: () => router.push("/athlete/health-sync"),
                } satisfies NavRow,
              ]
            : []),
          {
            key: "referral",
            icon: <Gift size={ROW_ICON_SIZE} />,
            label: t("referral"),
            hint: t("referralHint"),
            onPress: () => router.push("/athlete/referral"),
          },
        ]
      : []),
  ];

  const rowsByKeys = (keys: string[]) =>
    allAccountRows.filter((row) => keys.includes(row.key));
  const accountRows = rowsByKeys(["profile", "kyc", "roles"]);
  const activityRows = rowsByKeys([
    "achievements",
    "check-ins",
    "workouts",
    "goals",
    "progress-photos",
    "health-assessment",
    "health-sync",
    "nutrition",
  ]);
  const serviceRows = rowsByKeys([
    "messages",
    "qr-check-in",
    "subscription",
    "disputes",
    "family",
    "passes",
    "referral",
    "social",
  ]);
  const privacyRows = rowsByKeys(["data-grants", "data-rights"]);

  const supportRows: NavRow[] = [
    {
      key: "support",
      icon: <Headset1 size={ROW_ICON_SIZE} />,
      label: t("support"),
      hint: t("supportHint"),
      onPress: () => {
        window.location.href = `tel:${t("supportPhone")}`;
      },
    },
  ];

  const renderNavRow = (row: NavRow) => (
    <Button
      key={row.key}
      className={styles.rowPressable({ className: styles.row() })}
      fullWidth
      onPress={row.onPress}
      variant="ghost"
    >
      <span aria-hidden className={styles.rowIcon()}>
        {row.icon}
      </span>
      <span className={styles.rowBody()}>
        <Typography className={styles.rowLabel()} type="body" weight="medium">
          {row.label}
        </Typography>
        {row.hint ? (
          <Typography className={styles.rowHint()} type="body-sm">
            {row.hint}
          </Typography>
        ) : null}
      </span>
      <ChevronRight className={styles.rowChevron()} size={18} />
    </Button>
  );

  const renderGroup = (title: string, rows: NavRow[]) =>
    rows.length > 0 ? (
      <section className={styles.group()}>
        <Typography className={styles.groupTitle()} type="body-sm">
          {title}
        </Typography>
        <div className={styles.groupCard()}>
          {rows.map((row, index) => (
            <div key={row.key}>
              {renderNavRow(row)}
              {index < rows.length - 1 ? (
                <div aria-hidden className={styles.divider()} />
              ) : null}
            </div>
          ))}
        </div>
      </section>
    ) : null;

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

        {renderGroup(t("accountGroup"), accountRows)}
        {renderGroup(t("activityGroup"), activityRows)}
        {renderGroup(t("servicesGroup"), serviceRows)}
        {renderGroup(t("privacyGroup"), privacyRows)}

        <section className={styles.group()}>
          <Typography className={styles.groupTitle()} type="body-sm">
            {t("preferencesGroup")}
          </Typography>
          <div className={styles.groupCard()}>
            <Button
              className={styles.rowPressable({ className: styles.row() })}
              fullWidth
              onPress={() =>
                router.push(`/${roleSegment}/profile/notification-settings`)
              }
              variant="ghost"
            >
              <span aria-hidden className={styles.rowIcon()}>
                <Bell1 size={ROW_ICON_SIZE} />
              </span>
              <span className={styles.rowBody()}>
                <Typography
                  className={styles.rowLabel()}
                  type="body"
                  weight="medium"
                >
                  {t("notifications")}
                </Typography>
                <Typography className={styles.rowHint()} type="body-sm">
                  {t("notificationsHint")}
                </Typography>
              </span>
              <ChevronRight className={styles.rowChevron()} size={18} />
            </Button>

            <div aria-hidden className={styles.divider()} />

            <div className={styles.row()}>
              <span aria-hidden className={styles.rowIcon()}>
                <Moon size={ROW_ICON_SIZE} />
              </span>
              <span className={styles.rowBody()}>
                <Typography
                  className={styles.rowLabel()}
                  type="body"
                  weight="medium"
                >
                  {t("theme")}
                </Typography>
                <Typography className={styles.rowHint()} type="body-sm">
                  {t("themeHint")}
                </Typography>
              </span>
              <AnimatedThemeToggler aria-label={t("theme")} />
            </div>

            <div aria-hidden className={styles.divider()} />

            <div className={styles.row()}>
              <span aria-hidden className={styles.rowIcon()}>
                <Globe size={ROW_ICON_SIZE} />
              </span>
              <span className={styles.rowBody()}>
                <Typography
                  className={styles.rowLabel()}
                  type="body"
                  weight="medium"
                >
                  {t("language")}
                </Typography>
              </span>
              <span className={styles.rowValue()}>{t("languageValue")}</span>
            </div>
          </div>
        </section>

        <section className={styles.group()}>
          <Typography className={styles.groupTitle()} type="body-sm">
            {t("supportGroup")}
          </Typography>
          <div className={styles.groupCard()}>
            {supportRows.map(renderNavRow)}
            <div aria-hidden className={styles.divider()} />
            <div className={styles.row()}>
              <span aria-hidden className={styles.rowIcon()}>
                <InfoCircle size={ROW_ICON_SIZE} />
              </span>
              <span className={styles.rowBody()}>
                <Typography
                  className={styles.rowLabel()}
                  type="body"
                  weight="medium"
                >
                  {t("about")}
                </Typography>
              </span>
              <span className={styles.rowValue()}>{t("versionValue")}</span>
            </div>
          </div>
        </section>

        <Button
          className={styles.logout()}
          fullWidth
          size="lg"
          variant="danger"
          onPress={async () => {
            await logout();
            router.replace("/auth");
          }}
        >
          <Door size={ROW_ICON_SIZE} />
          {t("logout")}
        </Button>
      </div>
    </AppLayout>
  );
}
