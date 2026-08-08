"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  InputGroup,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import { ApiError } from "@repo/api";
import { Calendar1 } from "@repo/icons/Calendar1";
import { Check } from "@repo/icons/Check";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Gear1 } from "@repo/icons/Gear1";
import { GenderFemale } from "@repo/icons/GenderFemale";
import { Lock1 } from "@repo/icons/Lock1";
import { Pencil1 } from "@repo/icons/Pencil1";
import { Share1 } from "@repo/icons/Share1";
import { ShieldCheck } from "@repo/icons/ShieldCheck";
import { User } from "@repo/icons/User";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import {
  getProfileRoleShowcase,
  profileRolePrimaryHref,
} from "@/modules/account/lib/profile-role-data";
import { ProfileIdentitySection } from "@/modules/account/sections/ProfileIdentitySection";
import { ProfileShowcaseSection } from "@/modules/account/sections/ProfileShowcaseSection";
import { accountProfile } from "@/shared/lib/api";
import {
  isoToJalaliDisplay,
  jalaliDisplayToIso,
} from "@/shared/lib/jalali";
import { roleHomePath } from "@/shared/lib/role-routes";
import { useAuth } from "@/shared/providers/AuthProvider";
import { baseProfileScreenVariants } from "./BaseProfileScreen.styles";
import type { BaseProfileScreenProps } from "./BaseProfileScreen.types";

const FIELD_ICON = 18;

export function BaseProfileScreen({
  className,
  roleSegment = "athlete",
}: BaseProfileScreenProps) {
  const t = useTranslations("Mobile.Profile");
  const tRole = useTranslations("Mobile.RoleApply");
  const styles = baseProfileScreenVariants();
  const router = useRouter();
  const { user, activeRole, refreshUser, switchRole, logout } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDateJalali, setBirthDateJalali] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const showcase = useMemo(
    () => getProfileRoleShowcase(roleSegment),
    [roleSegment],
  );

  useEffect(() => {
    if (!user) return;
    setFirstName(user.name.first ?? "");
    setLastName(user.name.last ?? "");
    setGender(user.demographics.gender ?? "");
    setBirthDateJalali(isoToJalaliDisplay(user.demographics.birthDate));
    setCode(user.code ?? "");
  }, [user]);

  const showKycCta =
    user?.kyc.status === "none" || user?.kyc.status === "rejected";

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

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    let birthDate: string | undefined;
    if (birthDateJalali.trim()) {
      const iso = jalaliDisplayToIso(birthDateJalali);
      if (!iso) {
        setError(t("birthDateHint"));
        return;
      }
      birthDate = iso;
    }

    setIsPending(true);
    try {
      const next = await accountProfile.updateMe({
        name: {
          first: firstName.trim() || undefined,
          last: lastName.trim() || undefined,
        },
        demographics: {
          gender: gender || undefined,
          birthDate,
        },
        code: code.trim() || undefined,
      });
      refreshUser(next);
      setNotice(t("saved"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("errorSave"));
    } finally {
      setIsPending(false);
    }
  };

  const handleSwitch = async (role: "athlete" | "coach" | "club_owner") => {
    setError(null);
    try {
      const session = await switchRole(role);
      router.replace(roleHomePath(session.activeRole));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("errorSave"));
    }
  };

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <Header
          className="border-b-0 bg-background"
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.push(roleHomePath(activeRole))}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
          endContent={
            <Button
              aria-label={t("settings")}
              isIconOnly
              onPress={() => router.push(`/${roleSegment}/settings`)}
              size="lg"
              variant="ghost"
            >
              <Gear1 className="text-foreground" size={22} />
            </Button>
          }
        />
      }
    >
      <div className={styles.content()}>
        <ProfileIdentitySection
          name={displayName}
          roleLabel={activeRoleLabel}
          subtitle={t(showcase.subtitleKey)}
        />

        <ProfileShowcaseSection showcase={showcase} t={t} />

        <div className={styles.actions()}>
          <Button
            fullWidth
            size="lg"
            variant="primary"
            onPress={() => router.push(profileRolePrimaryHref(roleSegment))}
          >
            <Pencil1 size={18} />
            {t(showcase.primaryCtaKey)}
          </Button>
          <Button
            fullWidth
            size="lg"
            variant="outline"
            onPress={() => {
              if (typeof navigator !== "undefined" && navigator.share) {
                void navigator.share({ title: displayName, text: displayName });
              }
            }}
          >
            <Share1 size={18} />
            {t("shareProfile")}
          </Button>
        </div>

        {showKycCta ? (
          <section className={styles.kycCard()}>
            <Typography className={styles.kycHint()} type="body-sm">
              {t("kycHint")}
            </Typography>
            <Button
              size="lg"
              variant="secondary"
              onPress={() => router.push(`/${roleSegment}/kyc`)}
            >
              <ShieldCheck size={20} />
              {t("kycCta")}
            </Button>
          </section>
        ) : null}

        <section className={styles.card()}>
          <Typography className={styles.sectionTitle()} type="h4" weight="bold">
            {t("baseInfoTitle")}
          </Typography>
          <Typography color="muted" type="body-sm">
            {t("subtitle")}
          </Typography>

          <form className={styles.form()} onSubmit={handleSave}>
            <div className={styles.fieldRow()}>
              <TextField
                className={styles.field()}
                fullWidth
                name="firstName"
                value={firstName}
                onChange={setFirstName}
              >
                <Label>{t("firstName")}</Label>
                <InputGroup variant="secondary">
                  <InputGroup.Prefix>
                    <User size={FIELD_ICON} />
                  </InputGroup.Prefix>
                  <InputGroup.Input />
                </InputGroup>
              </TextField>

              <TextField
                className={styles.field()}
                fullWidth
                name="lastName"
                value={lastName}
                onChange={setLastName}
              >
                <Label>{t("lastName")}</Label>
                <InputGroup variant="secondary">
                  <InputGroup.Prefix>
                    <User size={FIELD_ICON} />
                  </InputGroup.Prefix>
                  <InputGroup.Input />
                </InputGroup>
              </TextField>
            </div>

            <TextField
              className={styles.field()}
              fullWidth
              name="gender"
              value={gender}
              onChange={setGender}
            >
              <Label>{t("gender")}</Label>
              <InputGroup variant="secondary">
                <InputGroup.Prefix>
                  <GenderFemale size={FIELD_ICON} />
                </InputGroup.Prefix>
                <InputGroup.Input
                  placeholder={`${t("genderMale")} / ${t("genderFemale")}`}
                />
              </InputGroup>
            </TextField>

            <TextField
              className={styles.field()}
              fullWidth
              name="birthDate"
              value={birthDateJalali}
              onChange={setBirthDateJalali}
            >
              <Label>{t("birthDate")}</Label>
              <InputGroup variant="secondary">
                <InputGroup.Prefix>
                  <Calendar1 size={FIELD_ICON} />
                </InputGroup.Prefix>
                <InputGroup.Input placeholder={t("birthDateHint")} />
              </InputGroup>
            </TextField>

            <TextField
              className={styles.field()}
              fullWidth
              name="code"
              value={code}
              onChange={setCode}
            >
              <Label>{t("code")}</Label>
              <Input />
            </TextField>

            {error ? (
              <p className={styles.error()} role="alert">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p className={styles.notice()} role="status">
                {notice}
              </p>
            ) : null}

            <div className={styles.formActions()}>
              <Button
                fullWidth
                isPending={isPending}
                size="lg"
                type="submit"
                variant="primary"
              >
                {t("updateProfile")}
                <Check size={18} />
              </Button>
            </div>
          </form>
        </section>

        <section className={styles.card()}>
          <Typography className={styles.sectionTitle()} type="h4" weight="bold">
            {t("switchRole")}
          </Typography>
          <div className={styles.roleRow()}>
            {user?.roles.includes("athlete") && activeRole !== "athlete" ? (
              <Button
                size="lg"
                variant="outline"
                onPress={() => handleSwitch("athlete")}
              >
                {tRole("athlete")}
              </Button>
            ) : null}
            {user?.roles.includes("coach") && activeRole !== "coach" ? (
              <Button
                size="lg"
                variant="outline"
                onPress={() => handleSwitch("coach")}
              >
                {tRole("coach")}
              </Button>
            ) : null}
            {user?.roles.includes("club_owner") &&
            activeRole !== "club_owner" ? (
              <Button
                size="lg"
                variant="outline"
                onPress={() => handleSwitch("club_owner")}
              >
                {tRole("owner")}
              </Button>
            ) : null}
            <Button
              size="lg"
              variant="secondary"
              onPress={() => router.push(`/${roleSegment}/roles`)}
            >
              {t("applyRole")}
            </Button>
          </div>
        </section>

        <Button
          fullWidth
          size="lg"
          variant="danger"
          onPress={async () => {
            await logout();
            router.replace("/auth/sign-in");
          }}
        >
          {t("logout")}
        </Button>

        <footer className={styles.privacy()}>
          <Lock1 aria-hidden className={styles.privacyIcon()} size={16} />
          <Typography className={styles.privacyText()} type="body-sm">
            {t("privacyNote")}
          </Typography>
        </footer>
      </div>
    </AppLayout>
  );
}
