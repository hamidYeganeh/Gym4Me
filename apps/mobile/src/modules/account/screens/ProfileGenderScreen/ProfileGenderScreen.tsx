"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ApiError } from "@repo/api";
import { Check } from "@repo/icons/Check";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import {
  ONBOARDING_GENDERS,
  type OnboardingGenderId,
} from "@/modules/app/lib/onboarding-data";
import { OnboardingGenderSection } from "@/modules/app/sections/OnboardingGenderSection";
import type { OnboardingGenderOption } from "@/modules/app/sections/OnboardingGenderSection";
import { accountProfile } from "@/shared/lib/api";
import { getChoiceGroup } from "@/shared/lib/choices-cache";
import { useRouter } from "@/shared/lib/app-router";
import { useAuth } from "@/shared/providers/AuthProvider";
import { profileGenderScreenVariants } from "./ProfileGenderScreen.styles";
import type { ProfileGenderScreenProps } from "./ProfileGenderScreen.types";

function parseOnboardingGender(value: string | null | undefined): OnboardingGenderId | null {
  if (value === "male" || value === "female") return value;
  return null;
}

export function ProfileGenderScreen({
  className,
  roleSegment = "athlete",
}: ProfileGenderScreenProps) {
  const t = useTranslations("Mobile.ProfileSettings");
  const tOnboarding = useTranslations("Mobile.Onboarding");
  const styles = profileGenderScreenVariants();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const editPath = `/${roleSegment}/profile/edit`;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gender, setGender] = useState<OnboardingGenderId | null>(null);
  const [apiOptions, setApiOptions] = useState<OnboardingGenderOption[] | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void Promise.all([
      accountProfile.getMe(),
      getChoiceGroup("gender").catch(() => null),
    ])
      .then(([me, genderGroup]) => {
        if (cancelled) return;
        setGender(parseOnboardingGender(me.demographics.gender));
        if (genderGroup) {
          const next = genderGroup.options
            .filter((option) => option.isActive !== false)
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((option) => {
              const id = parseOnboardingGender(option.value);
              return id ? { id, label: option.name } : null;
            })
            .filter((option): option is OnboardingGenderOption =>
              Boolean(option),
            )
            .filter((option) => ONBOARDING_GENDERS.includes(option.id));
          if (next.length > 0) {
            setApiOptions(next);
          }
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : t("errorGenderLoad"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [t]);

  const options = useMemo<OnboardingGenderOption[]>(() => {
    if (apiOptions && apiOptions.length > 0) return apiOptions;
    return ONBOARDING_GENDERS.map((id) => ({
      id,
      label: tOnboarding(`gender.options.${id}`),
    }));
  }, [apiOptions, tOnboarding]);

  const save = async () => {
    if (!gender) return;
    setSaving(true);
    setError(null);
    try {
      const next = await accountProfile.updateMe({
        demographics: { gender },
      });
      refreshUser(next);
      router.replace(editPath);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("errorGenderSave"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.push(editPath)}
          title={t("editGenderTitle")}
        />
      }
    >
      <div className={styles.content()}>
        {loading ? (
          <div className={styles.status()}>
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className={styles.picker()}>
              <OnboardingGenderSection
                options={options}
                value={gender}
                onChange={setGender}
              />
            </div>

            {error ? (
              <Typography className={styles.error()} role="alert" type="body-sm">
                {error}
              </Typography>
            ) : null}

            <div className={styles.actions()}>
              <Button
                fullWidth
                isDisabled={!gender}
                isPending={saving}
                size="lg"
                variant="primary"
                onPress={() => {
                  void save();
                }}
              >
                {t("confirm")}
                <Check size={18} />
              </Button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
