"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react/button";
import { Switch } from "@heroui/react/switch";
import { Typography } from "@heroui/react/typography";
import { Bell1 } from "@repo/icons/Bell1";
import { Chat } from "@repo/icons/Chat";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Envelope1 } from "@repo/icons/Envelope1";
import { Megaphone } from "@repo/icons/Megaphone";
import { Telephone1 } from "@repo/icons/Telephone1";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { ProfileMenuRow } from "@/modules/account/components/ProfileMenuRow";
import { notificationSettingsScreenVariants } from "./NotificationSettingsScreen.styles";
import type { NotificationSettingsScreenProps } from "./NotificationSettingsScreen.types";

const ICON = 22;

type ChannelKey = keyof NotificationSettingsScreenProps["preferences"]["channels"];

export function NotificationSettingsScreen({
  className,
  roleSegment = "athlete",
  preferences,
  pending = false,
  error = null,
  onUpdate,
}: NotificationSettingsScreenProps) {
  const t = useTranslations("Mobile.NotificationSettings");
  const styles = notificationSettingsScreenVariants();
  const router = useRouter();

  const toggleChannel = (key: ChannelKey, value: boolean) => {
    void onUpdate?.({ channels: { [key]: value } });
  };

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <Header
          appearance="bar"
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.push(`/${roleSegment}/profile`)}
              size="lg"
              variant="tertiary"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
          title={t("title")}
        />
      }
    >
      <div className={styles.content()}>
        {error ? (
          <Typography className="text-danger" type="body-sm">
            {t("errorSave")}
          </Typography>
        ) : null}

        <section className={styles.group()}>
          <Typography className={styles.groupTitle()} type="body-sm">
            {t("channelsGroup")}
          </Typography>
          <div className={styles.stack()}>
            <ProfileMenuRow
              hint={t("pushHint")}
              icon={<Bell1 size={ICON} />}
              label={t("push")}
              showChevron={false}
              trailing={
                <Switch
                  aria-label={t("push")}
                  isDisabled={pending}
                  isSelected={preferences.channels.push}
                  onChange={(value) => toggleChannel("push", value)}
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch>
              }
            />
            <ProfileMenuRow
              hint={t("smsHint")}
              icon={<Telephone1 size={ICON} />}
              label={t("sms")}
              showChevron={false}
              trailing={
                <Switch
                  aria-label={t("sms")}
                  isDisabled={pending}
                  isSelected={preferences.channels.sms}
                  onChange={(value) => toggleChannel("sms", value)}
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch>
              }
            />
            <ProfileMenuRow
              hint={t("inAppHint")}
              icon={<Chat size={ICON} />}
              label={t("inApp")}
              showChevron={false}
              trailing={
                <Switch
                  aria-label={t("inApp")}
                  isDisabled={pending}
                  isSelected={preferences.channels.inApp}
                  onChange={(value) => toggleChannel("inApp", value)}
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch>
              }
            />
            <ProfileMenuRow
              hint={t("emailHint")}
              icon={<Envelope1 size={ICON} />}
              label={t("email")}
              showChevron={false}
              trailing={
                <Switch
                  aria-label={t("email")}
                  isDisabled={pending}
                  isSelected={preferences.channels.email}
                  onChange={(value) => toggleChannel("email", value)}
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch>
              }
            />
            <ProfileMenuRow
              hint={t("marketingHint")}
              icon={<Megaphone size={ICON} />}
              label={t("marketing")}
              showChevron={false}
              trailing={
                <Switch
                  aria-label={t("marketing")}
                  isDisabled={pending}
                  isSelected={preferences.channels.marketing}
                  onChange={(value) => toggleChannel("marketing", value)}
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch>
              }
            />
          </div>
        </section>

        <section className={styles.group()}>
          <Typography className={styles.groupTitle()} type="body-sm">
            {t("inboxGroup")}
          </Typography>
          <div className={styles.stack()}>
            <ProfileMenuRow
              hint={t("inboxHint")}
              icon={<Bell1 size={ICON} />}
              label={t("openInbox")}
              onPress={() => router.push(`/${roleSegment}/notifications`)}
            />
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
