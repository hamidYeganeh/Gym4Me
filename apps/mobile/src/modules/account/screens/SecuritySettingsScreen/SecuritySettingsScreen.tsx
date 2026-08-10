"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Switch, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Door } from "@repo/icons/Door";
import { FaceId } from "@repo/icons/FaceId";
import { Fingerprint1 } from "@repo/icons/Fingerprint1";
import { Key1 } from "@repo/icons/Key1";
import { Lock1 } from "@repo/icons/Lock1";
import { User } from "@repo/icons/User";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { ProfileMenuRow } from "@/modules/account/components/ProfileMenuRow";
import { useAuth } from "@/shared/providers/AuthProvider";
import { securitySettingsScreenVariants } from "./SecuritySettingsScreen.styles";
import type { SecuritySettingsScreenProps } from "./SecuritySettingsScreen.types";

const ICON = 22;

export function SecuritySettingsScreen({
  className,
  roleSegment = "athlete",
}: SecuritySettingsScreenProps) {
  const t = useTranslations("Mobile.SecuritySettings");
  const styles = securitySettingsScreenVariants();
  const router = useRouter();
  const { logout } = useAuth();
  const [pinEnabled, setPinEnabled] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(true);
  const [faceId, setFaceId] = useState(false);
  const [accountRecovery, setAccountRecovery] = useState(true);

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <Header
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.push(`/${roleSegment}/profile`)}
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

        <div className={styles.stack()}>
          <ProfileMenuRow
            hint={t("setPasswordHint")}
            icon={<Lock1 size={ICON} />}
            label={t("setPassword")}
            onPress={() =>
              router.push(`/${roleSegment}/profile/security/password`)
            }
          />
          <ProfileMenuRow
            hint={t("pinHint")}
            icon={<Key1 size={ICON} />}
            label={t("enablePin")}
            showChevron={false}
            trailing={
              <Switch
                aria-label={t("enablePin")}
                isSelected={pinEnabled}
                onChange={setPinEnabled}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch>
            }
          />
          <ProfileMenuRow
            hint={t("biometricHint")}
            icon={<Fingerprint1 size={ICON} />}
            label={t("biometric")}
            onPress={() => undefined}
          />
          <ProfileMenuRow
            hint={t("logoutAllHint")}
            icon={<Door size={ICON} />}
            label={t("logoutAll")}
            onPress={async () => {
              await logout({ revoke: true });
              router.replace("/auth");
            }}
          />
          <ProfileMenuRow
            icon={<Lock1 size={ICON} />}
            label={t("rememberLogin")}
            showChevron={false}
            trailing={
              <Switch
                aria-label={t("rememberLogin")}
                isSelected={rememberLogin}
                onChange={setRememberLogin}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch>
            }
          />
          <ProfileMenuRow
            icon={<FaceId size={ICON} />}
            label={t("useFaceId")}
            showChevron={false}
            trailing={
              <Switch
                aria-label={t("useFaceId")}
                isSelected={faceId}
                onChange={setFaceId}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch>
            }
          />
          <ProfileMenuRow
            icon={<User size={ICON} />}
            label={t("accountRecovery")}
            showChevron={false}
            trailing={
              <Switch
                aria-label={t("accountRecovery")}
                isSelected={accountRecovery}
                onChange={setAccountRecovery}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch>
            }
          />
        </div>
      </div>
    </AppLayout>
  );
}
