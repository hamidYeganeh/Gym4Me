"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react/button";
import { Switch } from "@heroui/react/switch";
import { ArrowSignIn1 } from "@repo/icons/ArrowSignIn1";
import { ArrowSignOut1 } from "@repo/icons/ArrowSignOut1";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { FaceId } from "@repo/icons/FaceId";
import { Fingerprint1 } from "@repo/icons/Fingerprint1";
import { Key1 } from "@repo/icons/Key1";
import { User } from "@repo/icons/User";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { ProfileMenuRow } from "@/modules/account/components/ProfileMenuRow";
import { useAuth } from "@/shared/providers/AuthProvider";
import { securitySettingsScreenVariants } from "./SecuritySettingsScreen.styles";
import type { SecuritySettingsScreenProps } from "./SecuritySettingsScreen.types";

const ICON = 22;

function SecuritySwitch({
  label,
  isSelected,
  onChange,
}: {
  label: string;
  isSelected: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Switch
      aria-label={label}
      isSelected={isSelected}
      onChange={onChange}
      size="sm"
    >
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
    </Switch>
  );
}

export function SecuritySettingsScreen({
  className,
  roleSegment = "athlete",
}: SecuritySettingsScreenProps) {
  const t = useTranslations("Mobile.SecuritySettings");
  const styles = securitySettingsScreenVariants();
  const router = useRouter();
  const { logout } = useAuth();
  const [pinEnabled, setPinEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(true);
  const [faceId, setFaceId] = useState(false);

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
        <div className={styles.stack()}>
          <ProfileMenuRow
            className={styles.row()}
            hint={t("pinHint")}
            icon={<Key1 size={ICON} />}
            label={t("enablePin")}
            showChevron={false}
            trailing={
              <SecuritySwitch
                isSelected={pinEnabled}
                label={t("enablePin")}
                onChange={setPinEnabled}
              />
            }
          />
          <ProfileMenuRow
            className={styles.row()}
            hint={t("biometricHint")}
            icon={<Fingerprint1 size={ICON} />}
            label={t("biometric")}
            showChevron={false}
            trailing={
              <SecuritySwitch
                isSelected={biometricEnabled}
                label={t("biometric")}
                onChange={setBiometricEnabled}
              />
            }
          />
          <ProfileMenuRow
            className={styles.row()}
            icon={<ArrowSignIn1 size={ICON} />}
            label={t("rememberLogin")}
            showChevron={false}
            trailing={
              <SecuritySwitch
                isSelected={rememberLogin}
                label={t("rememberLogin")}
                onChange={setRememberLogin}
              />
            }
          />
          <ProfileMenuRow
            className={styles.row()}
            icon={<FaceId size={ICON} />}
            label={t("useFaceId")}
            showChevron={false}
            trailing={
              <SecuritySwitch
                isSelected={faceId}
                label={t("useFaceId")}
                onChange={setFaceId}
              />
            }
          />
          <ProfileMenuRow
            className={styles.row()}
            icon={<User size={ICON} />}
            label={t("accountRecovery")}
            onPress={() => router.push(`/${roleSegment}/profile/help`)}
          />
          <ProfileMenuRow
            className={styles.row()}
            hint={t("logoutAllHint")}
            icon={<ArrowSignOut1 size={ICON} />}
            label={t("logoutAll")}
            onPress={async () => {
              await logout({ revoke: true });
              router.replace("/auth");
            }}
          />
        </div>
      </div>
    </AppLayout>
  );
}
