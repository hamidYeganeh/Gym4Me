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
import { Check } from "@repo/icons/Check";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Lock1 } from "@repo/icons/Lock1";
import { Note1 } from "@repo/icons/Note1";
import { Ruler1 } from "@repo/icons/Ruler1";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { accountProfile } from "@/shared/lib/api";
import { athleteProfileEditScreenVariants } from "./AthleteProfileEditScreen.styles";
import type { AthleteProfileEditScreenProps } from "./AthleteProfileEditScreen.types";

const FIELD_ICON = 18;

export function AthleteProfileEditScreen({
  className,
}: AthleteProfileEditScreenProps) {
  const t = useTranslations("Mobile.AthleteProfile");
  const tProfile = useTranslations("Mobile.Profile");
  const styles = athleteProfileEditScreenVariants();
  const router = useRouter();
  const [bio, setBio] = useState("");
  const [levelKey, setLevelKey] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    void accountProfile
      .getAthlete()
      .then((profile) => {
        setBio(profile.bio ?? "");
        setLevelKey(profile.levelKey ?? "");
        setHeightCm(
          profile.body.heightCm != null ? String(profile.body.heightCm) : "",
        );
        setWeightKg(
          profile.body.weightKg != null ? String(profile.body.weightKg) : "",
        );
      })
      .catch(() => {
        setError(t("error"));
      });
  }, [t]);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsPending(true);
    try {
      await accountProfile.updateAthlete({
        bio: bio.trim() || undefined,
        levelKey: levelKey.trim() || undefined,
        body: {
          heightCm: heightCm ? Number(heightCm) : undefined,
          weightKg: weightKg ? Number(weightKg) : undefined,
        },
      });
      setNotice(t("saved"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error"));
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
              onPress={() => router.push("/athlete/profile")}
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
        <header className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.subtitle()} type="body">
            {t("subtitle")}
          </Typography>
        </header>

        <form className={styles.form()} onSubmit={handleSave}>
          <TextField
            className={styles.field()}
            fullWidth
            name="bio"
            value={bio}
            onChange={setBio}
          >
            <Label>{t("bio")}</Label>
            <InputGroup variant="secondary">
              <InputGroup.Prefix>
                <Note1 size={FIELD_ICON} />
              </InputGroup.Prefix>
              <InputGroup.Input />
            </InputGroup>
          </TextField>
          <TextField
            className={styles.field()}
            fullWidth
            name="levelKey"
            value={levelKey}
            onChange={setLevelKey}
          >
            <Label>{t("levelKey")}</Label>
            <Input />
          </TextField>
          <TextField
            className={styles.field()}
            fullWidth
            name="heightCm"
            value={heightCm}
            onChange={setHeightCm}
          >
            <Label>{t("heightCm")}</Label>
            <InputGroup variant="secondary">
              <InputGroup.Prefix>
                <Ruler1 size={FIELD_ICON} />
              </InputGroup.Prefix>
              <InputGroup.Input inputMode="numeric" />
            </InputGroup>
          </TextField>
          <TextField
            className={styles.field()}
            fullWidth
            name="weightKg"
            value={weightKg}
            onChange={setWeightKg}
          >
            <Label>{t("weightKg")}</Label>
            <Input inputMode="decimal" />
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

          <div className={styles.actions()}>
            <Button
              fullWidth
              isPending={isPending}
              size="lg"
              type="submit"
              variant="primary"
            >
              {t("save")}
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
