"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "@/shared/lib/app-router";

import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { InputGroup } from "@heroui/react/input-group";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import type { CoachProfile } from "@repo/api";
import { ApiError } from "@repo/api";
import { Check } from "@repo/icons/Check";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Lock1 } from "@repo/icons/Lock1";
import { Note1 } from "@repo/icons/Note1";
import { SealCheck } from "@repo/icons/SealCheck";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { accountProfile, mediaApi } from "@/shared/lib/api";
import { coachProfileEditScreenVariants } from "./CoachProfileEditScreen.styles";
import type { CoachProfileEditScreenProps } from "./CoachProfileEditScreen.types";

const FIELD_ICON = 18;

export function CoachProfileEditScreen({
  className,
}: CoachProfileEditScreenProps) {
  const t = useTranslations("Mobile.CoachProfile");
  const tProfile = useTranslations("Mobile.Profile");
  const styles = coachProfileEditScreenVariants();
  const router = useRouter();
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [bio, setBio] = useState("");
  const [headline, setHeadline] = useState("");
  const [years, setYears] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void accountProfile
      .getCoach()
      .then((next) => {
        setProfile(next);
        setBio(next.bio ?? "");
        setHeadline(next.experience.headline ?? "");
        setYears(
          next.experience.years != null ? String(next.experience.years) : "",
        );
      })
      .catch(() => setError(t("error")));
  }, [t]);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsPending(true);
    try {
      const next = await accountProfile.updateCoach({
        bio: bio.trim() || undefined,
        experience: {
          headline: headline.trim() || undefined,
          years: years ? Number(years) : undefined,
        },
      });
      setProfile(next);
      setNotice(t("saved"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error"));
    } finally {
      setIsPending(false);
    }
  };

  const handleVerification = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setNotice(null);
    setIsSubmitting(true);
    try {
      const uploaded = await mediaApi.upload(file);
      const next = await accountProfile.submitCoachVerification({
        documentMediaIds: [uploaded.id],
      });
      setProfile(next);
      setNotice(t("saved"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error"));
    } finally {
      setIsSubmitting(false);
    }
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
              onPress={() => router.push("/coach/profile")}
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
        {profile ? (
          <div className={styles.status()}>
            {t("verificationStatus")}: {profile.verification.status}
          </div>
        ) : null}

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
            name="headline"
            value={headline}
            onChange={setHeadline}
          >
            <Label>{t("headline")}</Label>
            <Input />
          </TextField>
          <TextField
            className={styles.field()}
            fullWidth
            name="years"
            value={years}
            onChange={setYears}
          >
            <Label>{t("years")}</Label>
            <Input inputMode="numeric" />
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

        <section className={styles.verifyCard()}>
          <Typography type="h4" weight="bold">
            {t("submitVerification")}
          </Typography>
          <Label>
            <span className="inline-flex items-center gap-2">
              <SealCheck size={FIELD_ICON} />
              {t("submitVerification")}
            </span>
            <input
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="mt-2 block w-full text-sm text-muted file:me-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-accent-foreground"
              type="file"
              onChange={(event) => {
                void handleVerification(event.target.files?.[0] ?? null);
              }}
            />
          </Label>
          {isSubmitting ? (
            <Typography color="muted" type="body-sm">
              …
            </Typography>
          ) : null}
        </section>

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
