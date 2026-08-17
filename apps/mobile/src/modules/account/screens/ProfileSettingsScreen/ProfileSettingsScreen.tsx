"use client";

import { useEffect, useState, type FormEvent } from "react";
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
import { ArrowUpload } from "@repo/icons/ArrowUpload";
import { Calendar1 } from "@repo/icons/Calendar1";
import { Check } from "@repo/icons/Check";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { GenderFemale } from "@repo/icons/GenderFemale";
import { Lock1 } from "@repo/icons/Lock1";
import { User } from "@repo/icons/User";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { accountProfile } from "@/shared/lib/api";
import {
  isoToJalaliDisplay,
  jalaliDisplayToIso,
} from "@/shared/lib/jalali";
import { useAuth } from "@/shared/providers/AuthProvider";
import { profileSettingsScreenVariants } from "./ProfileSettingsScreen.styles";
import type { ProfileSettingsScreenProps } from "./ProfileSettingsScreen.types";

const FIELD_ICON = 18;

export function ProfileSettingsScreen({
  className,
  roleSegment = "athlete",
}: ProfileSettingsScreenProps) {
  const t = useTranslations("Mobile.ProfileSettings");
  const tProfile = useTranslations("Mobile.Profile");
  const styles = profileSettingsScreenVariants();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDateJalali, setBirthDateJalali] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.name.first ?? "");
    setLastName(user.name.last ?? "");
    setGender(user.demographics.gender ?? "");
    setBirthDateJalali(isoToJalaliDisplay(user.demographics.birthDate));
    setCode(user.code ?? "");
  }, [user]);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    let birthDate: string | undefined;
    if (birthDateJalali.trim()) {
      const iso = jalaliDisplayToIso(birthDateJalali);
      if (!iso) {
        setError(tProfile("birthDateHint"));
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
      setNotice(tProfile("saved"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : tProfile("errorSave"));
    } finally {
      setIsPending(false);
    }
  };

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

        <div className={styles.avatarWrap()}>
          <div aria-hidden className={styles.avatar()}>
            <ArrowUpload size={28} />
          </div>
        </div>

        <form className={styles.form()} onSubmit={handleSave}>
          <div className={styles.fieldRow()}>
            <TextField
              className={styles.field()}
              fullWidth
              name="firstName"
              value={firstName}
              onChange={setFirstName}
            >
              <Label>{tProfile("firstName")}</Label>
              <InputGroup variant="secondary">
                <InputGroup.Prefix>
                  <User size={FIELD_ICON} />
                </InputGroup.Prefix>
                <InputGroup.Input placeholder={t("fullNamePlaceholder")} />
              </InputGroup>
            </TextField>

            <TextField
              className={styles.field()}
              fullWidth
              name="lastName"
              value={lastName}
              onChange={setLastName}
            >
              <Label>{tProfile("lastName")}</Label>
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
            <Label>{tProfile("gender")}</Label>
            <InputGroup variant="secondary">
              <InputGroup.Prefix>
                <GenderFemale size={FIELD_ICON} />
              </InputGroup.Prefix>
              <InputGroup.Input
                placeholder={`${tProfile("genderMale")} / ${tProfile("genderFemale")}`}
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
            <Label>{tProfile("birthDate")}</Label>
            <InputGroup variant="secondary">
              <InputGroup.Prefix>
                <Calendar1 size={FIELD_ICON} />
              </InputGroup.Prefix>
              <InputGroup.Input placeholder={tProfile("birthDateHint")} />
            </InputGroup>
          </TextField>

          <TextField
            className={styles.field()}
            fullWidth
            name="code"
            value={code}
            onChange={setCode}
          >
            <Label>{tProfile("code")}</Label>
            <Input />
          </TextField>

          {error ? (
            <Typography className={styles.error()} role="alert" type="body-sm">
              {error}
            </Typography>
          ) : null}
          {notice ? (
            <Typography className={styles.notice()} role="status" type="body-sm">
              {notice}
            </Typography>
          ) : null}

          <div className={styles.formActions()}>
            <Button
              fullWidth
              isPending={isPending}
              size="lg"
              type="submit"
              variant="primary"
            >
              {tProfile("updateProfile")}
              <Check size={18} />
            </Button>
          </div>
        </form>

        <footer className={styles.privacy()}>
          <Lock1 aria-hidden className={styles.privacyIcon()} size={16} />
          <Typography className={styles.privacyText()} type="body-sm">
            {tProfile("privacyNote")}
          </Typography>
        </footer>
      </div>
    </AppLayout>
  );
}
