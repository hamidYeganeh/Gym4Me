"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import {
  accountProfile,
  basicsLocations,
  isDiscoveryApiId,
  mediaApi,
  mediaFileUrl,
} from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import {
  buildUpdateAthleteInput,
  buildUpdateCoachInput,
  buildUpdateMeInput,
  emptyProfileSettingsValues,
  formatIranPhoneDisplay,
  formValuesFromUser,
  joinFullName,
  type ProfileProvinceOption,
  type ProfileSettingsFormValues,
  type ProfileSettingsSaveError,
} from "./profile-settings";

export type ProfileSettingsRoleSegment = "athlete" | "coach" | "owner";

export function useProfileSettings(
  roleSegment: ProfileSettingsRoleSegment = "athlete",
) {
  const t = useTranslations("Mobile.ProfileSettings");
  const tProfile = useTranslations("Mobile.Profile");
  const { user, refreshUser } = useAuth();
  const hydratedUserId = useRef<string | null>(null);
  const hydratedRoleId = useRef<string | null>(null);

  const [values, setValues] = useState<ProfileSettingsFormValues>(
    emptyProfileSettingsValues(),
  );
  const [provinces, setProvinces] = useState<ProfileProvinceOption[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (hydratedUserId.current === user.id) return;
    hydratedUserId.current = user.id;
    setValues((current) => ({
      ...formValuesFromUser(user),
      athlete: current.athlete,
      coach: current.coach,
    }));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const key = `${user.id}:${roleSegment}`;
    if (hydratedRoleId.current === key) return;
    hydratedRoleId.current = key;

    if (roleSegment === "athlete") {
      void accountProfile
        .getAthlete()
        .then((profile) => {
          setValues((current) => ({
            ...current,
            athlete: {
              bio: profile.bio ?? "",
              levelKey: profile.levelKey ?? "",
              heightCm:
                profile.body.heightCm != null
                  ? String(profile.body.heightCm)
                  : "",
              weightKg:
                profile.body.weightKg != null
                  ? String(profile.body.weightKg)
                  : "",
            },
            coach: null,
          }));
        })
        .catch(() => {
          setValues((current) => ({ ...current, athlete: null, coach: null }));
        });
      return;
    }

    if (roleSegment === "coach") {
      void accountProfile
        .getCoach()
        .then((profile) => {
          setValues((current) => ({
            ...current,
            athlete: null,
            coach: {
              bio: profile.bio ?? "",
              headline: profile.experience.headline ?? "",
              years:
                profile.experience.years != null
                  ? String(profile.experience.years)
                  : "",
            },
          }));
        })
        .catch(() => {
          setValues((current) => ({ ...current, athlete: null, coach: null }));
        });
      return;
    }

    setValues((current) => ({ ...current, athlete: null, coach: null }));
  }, [roleSegment, user]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const countries = await basicsLocations.listCountries();
        const iran =
          countries.result.find((item) => item.slug === "iran") ??
          countries.result[0];
        if (!iran || cancelled) return;
        const page = await basicsLocations.listProvinces(iran.id);
        if (cancelled || page.result.length === 0) return;
        setProvinces(
          page.result.map((item) => ({ id: item.id, name: item.name })),
        );
      } catch {
        // Keep an empty province list; the field stays selectable when data arrives.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const patchValues = (patch: Partial<ProfileSettingsFormValues>) => {
    setValues((current) => ({ ...current, ...patch }));
  };

  const patchAthlete = (patch: Partial<NonNullable<ProfileSettingsFormValues["athlete"]>>) => {
    setValues((current) =>
      current.athlete
        ? { ...current, athlete: { ...current.athlete, ...patch } }
        : current,
    );
  };

  const patchCoach = (patch: Partial<NonNullable<ProfileSettingsFormValues["coach"]>>) => {
    setValues((current) =>
      current.coach
        ? { ...current, coach: { ...current.coach, ...patch } }
        : current,
    );
  };

  const phoneDisplay = user?.phone ? formatIranPhoneDisplay(user.phone) : "";
  const nationalIdDisplay = user?.nationalId ?? "";
  const referralCodeDisplay = user?.referralCode ?? "";
  const avatarSrc =
    avatarPreview ?? mediaFileUrl(user?.avatar.mediaId) ?? null;
  const displayName = useMemo(() => {
    const full = joinFullName(values.name.first, values.name.last);
    if (full) return full;
    return user?.code ?? t("title");
  }, [t, user?.code, values.name.first, values.name.last]);

  const uploadAvatar = (file: File) => {
    if (avatarPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setIsAvatarUploading(true);
    setError(null);
    setNotice(null);
    void mediaApi
      .upload(file)
      .then((asset) =>
        accountProfile.updateMe({ avatar: { mediaId: asset.id } }),
      )
      .then((next) => {
        refreshUser(next);
        setAvatarPreview(null);
        setNotice(tProfile("saved"));
      })
      .catch((err) => {
        setAvatarPreview(null);
        setError(err instanceof ApiError ? err.message : t("errorAvatar"));
      })
      .finally(() => {
        setIsAvatarUploading(false);
      });
  };

  const save = async () => {
    setError(null);
    setNotice(null);

    const built = buildUpdateMeInput(values);
    const saveErrors: Record<ProfileSettingsSaveError, string> = {
      birthDate: tProfile("birthDateHint"),
      postalCode: t("postalCodeHint"),
      code: t("codeHint"),
      height: t("heightHint"),
      weight: t("weightHint"),
      years: t("yearsHint"),
    };
    if (!built.ok) {
      setError(saveErrors[built.error]);
      return;
    }

    const athleteBuilt = values.athlete
      ? buildUpdateAthleteInput(values.athlete)
      : null;
    if (athleteBuilt && !athleteBuilt.ok) {
      setError(saveErrors[athleteBuilt.error]);
      return;
    }

    const coachBuilt = values.coach
      ? buildUpdateCoachInput(values.coach)
      : null;
    if (coachBuilt && !coachBuilt.ok) {
      setError(saveErrors[coachBuilt.error]);
      return;
    }

    const input = { ...built.input };
    if (
      input.address?.provinceId &&
      !isDiscoveryApiId(input.address.provinceId)
    ) {
      delete input.address.provinceId;
    }

    setIsPending(true);
    try {
      const next = await accountProfile.updateMe(input);
      refreshUser(next);
      if (athleteBuilt?.ok) {
        await accountProfile.updateAthlete(athleteBuilt.input);
      }
      if (coachBuilt?.ok) {
        await accountProfile.updateCoach(coachBuilt.input);
      }
      setNotice(tProfile("saved"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : tProfile("errorSave"));
    } finally {
      setIsPending(false);
    }
  };

  return {
    values,
    provinces,
    phoneDisplay,
    nationalIdDisplay,
    referralCodeDisplay,
    avatarSrc,
    displayName,
    isAvatarUploading,
    error,
    notice,
    isPending,
    patchValues,
    patchAthlete,
    patchCoach,
    uploadAvatar,
    save,
  };
}
