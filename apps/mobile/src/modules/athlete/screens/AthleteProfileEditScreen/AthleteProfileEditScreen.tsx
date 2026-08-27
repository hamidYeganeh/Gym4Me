"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "@/shared/lib/app-router";

import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { InputGroup } from "@heroui/react/input-group";
import { Label } from "@heroui/react/label";
import { ListBox } from "@heroui/react/list-box";
import { Select } from "@heroui/react/select";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { ApiError } from "@repo/api";
import { Check } from "@repo/icons/Check";
import { Lock1 } from "@repo/icons/Lock1";
import { Note1 } from "@repo/icons/Note1";
import { Ruler1 } from "@repo/icons/Ruler1";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import type { ProfileLevelOption } from "@/modules/account/lib/profile-settings";
import { accountProfile } from "@/shared/lib/api";
import { getChoiceGroup } from "@/shared/lib/choices-cache";
import { athleteProfileEditScreenVariants } from "./AthleteProfileEditScreen.styles";
import type { AthleteProfileEditScreenProps } from "./AthleteProfileEditScreen.types";

const FIELD_ICON = 18;

export function AthleteProfileEditScreen({
  className,
}: AthleteProfileEditScreenProps) {
  const t = useTranslations("Mobile.AthleteProfile");
  const tProfile = useTranslations("Mobile.Profile");
  const tSettings = useTranslations("Mobile.ProfileSettings");
  const styles = athleteProfileEditScreenVariants();
  const router = useRouter();
  const [bio, setBio] = useState("");
  const [levelKey, setLevelKey] = useState<string | null>(null);
  const [levelOptions, setLevelOptions] = useState<ProfileLevelOption[]>([]);
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
        setLevelKey(profile.levelKey);
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

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const group = await getChoiceGroup("athlete_level");
        if (cancelled) return;
        setLevelOptions(
          group.options
            .filter((option) => option.isActive !== false)
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((option) => ({
              value: option.value,
              name: option.name,
              description: option.description?.trim() || undefined,
            })),
        );
      } catch {
        if (!cancelled) setLevelOptions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsPending(true);
    try {
      await accountProfile.updateAthlete({
        bio: bio.trim() || undefined,
        levelKey: levelKey?.trim() || undefined,
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
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.push("/athlete/profile")}
          title={t("title")}
        />
      }
    >
      <div className={styles.content()}>
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
          <Select
            className={styles.field()}
            placeholder={tSettings("levelPlaceholder")}
            value={levelKey}
            onChange={(key) => setLevelKey(key == null ? null : String(key))}
          >
            <Label>{t("levelKey")}</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {levelOptions.map((option) => (
                  <ListBox.Item
                    id={option.value}
                    key={option.value}
                    textValue={option.name}
                  >
                    {option.name}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
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
            <Typography className={styles.error()} role="alert" type="body-sm">
              {error}
            </Typography>
          ) : null}
          {notice ? (
            <Typography
              className={styles.notice()}
              role="status"
              type="body-sm"
            >
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
