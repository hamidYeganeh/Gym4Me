"use client";

import { Button, Switch, Typography } from "@heroui/react";
import { Bell1 } from "@repo/icons/Bell1";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { Door } from "@repo/icons/Door";
import { Globe } from "@repo/icons/Globe";
import { Headset1 } from "@repo/icons/Headset1";
import { InfoCircle } from "@repo/icons/InfoCircle";
import { Moon } from "@repo/icons/Moon";
import { Pencil1 } from "@repo/icons/Pencil1";
import { ShieldCheck } from "@repo/icons/ShieldCheck";
import { UsersTwo } from "@repo/icons/UsersTwo";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AnimatedThemeToggler } from "@/shared/components/animated-theme-toggler";
import { useAuth } from "@/shared/providers/AuthProvider";
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const accountRows: NavRow[] = [
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
  ];

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

        <section className={styles.group()}>
          <Typography className={styles.groupTitle()} type="body-sm">
            {t("accountGroup")}
          </Typography>
          <div className={styles.groupCard()}>
            {accountRows.map((row, index) => (
              <div key={row.key}>
                {renderNavRow(row)}
                {index < accountRows.length - 1 ? (
                  <div aria-hidden className={styles.divider()} />
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.group()}>
          <Typography className={styles.groupTitle()} type="body-sm">
            {t("preferencesGroup")}
          </Typography>
          <div className={styles.groupCard()}>
            <div className={styles.row()}>
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
              <Switch
                aria-label={t("notifications")}
                isSelected={notificationsEnabled}
                onChange={setNotificationsEnabled}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch>
            </div>

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
