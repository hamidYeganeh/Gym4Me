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
  ONBOARDING_DEFAULT_HEIGHT_CM,
  ONBOARDING_HEIGHT_CM_RANGE,
} from "@/modules/app/lib/onboarding-data";
import {
  normalizeHeightUnit,
  type OnboardingHeightUnit,
  type OnboardingHeightUnitOption,
} from "@/modules/app/lib/onboarding-units";
import { OnboardingHeightSection } from "@/modules/app/sections/OnboardingHeightSection";
import { accountProfile } from "@/shared/lib/api";
import { getChoiceGroup } from "@/shared/lib/choices-cache";
import { useRouter } from "@/shared/lib/app-router";
import { profileHeightScreenVariants } from "./ProfileHeightScreen.styles";
import type { ProfileHeightScreenProps } from "./ProfileHeightScreen.types";

function clampHeightCm(value: number): number {
  return Math.min(
    ONBOARDING_HEIGHT_CM_RANGE.max,
    Math.max(ONBOARDING_HEIGHT_CM_RANGE.min, Math.round(value)),
  );
}

export function ProfileHeightScreen({
  className,
  roleSegment = "athlete",
}: ProfileHeightScreenProps) {
  const t = useTranslations("Mobile.ProfileSettings");
  const tOnboarding = useTranslations("Mobile.Onboarding");
  const styles = profileHeightScreenVariants();
  const router = useRouter();
  const editPath = `/${roleSegment}/profile/edit`;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heightCm, setHeightCm] = useState(ONBOARDING_DEFAULT_HEIGHT_CM);
  const [unit, setUnit] = useState<OnboardingHeightUnit>("cm");
  const [apiUnitOptions, setApiUnitOptions] = useState<
    OnboardingHeightUnitOption[] | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void Promise.all([
      accountProfile.getAthlete(),
      getChoiceGroup("height_unit").catch(() => null),
    ])
      .then(([profile, heightUnit]) => {
        if (cancelled) return;
        if (profile.body.heightCm != null) {
          setHeightCm(clampHeightCm(profile.body.heightCm));
        }
        if (heightUnit) {
          const next = heightUnit.options
            .filter((option) => option.isActive !== false)
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((option) => {
              const id = normalizeHeightUnit(option.value);
              return id ? { id, label: option.name } : null;
            })
            .filter((option): option is OnboardingHeightUnitOption =>
              Boolean(option),
            );
          if (next.length > 0) {
            setApiUnitOptions(next);
            setUnit(next[0]!.id);
          }
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : t("errorHeightLoad"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [t]);

  const unitOptions = useMemo<OnboardingHeightUnitOption[]>(() => {
    if (apiUnitOptions && apiUnitOptions.length > 0) return apiUnitOptions;
    return [
      { id: "ft", label: tOnboarding("height.unitFt") },
      { id: "cm", label: tOnboarding("height.unitCm") },
    ];
  }, [apiUnitOptions, tOnboarding]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await accountProfile.updateAthlete({
        body: { heightCm: clampHeightCm(heightCm) },
      });
      router.replace(editPath);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("errorHeightSave"));
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
          title={t("editHeightTitle")}
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
              <OnboardingHeightSection
                heightCm={heightCm}
                label={t("height")}
                onHeightCmChange={setHeightCm}
                onUnitChange={setUnit}
                unit={unit}
                unitOptions={unitOptions}
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
