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
  buildUpdateMeInput,
  formatIranPhoneDisplay,
  formValuesFromUser,
  type ProfileProvinceOption,
  type ProfileSettingsFormValues,
} from "./profile-settings";

export function useProfileSettings() {
  const t = useTranslations("Mobile.ProfileSettings");
  const tProfile = useTranslations("Mobile.Profile");
  const { user, refreshUser } = useAuth();
  const hydratedUserId = useRef<string | null>(null);

  const [values, setValues] = useState<ProfileSettingsFormValues>({
    fullName: "",
    provinceId: null,
    gender: "",
    birthDateJalali: "",
    street: "",
    apartment: "",
    city: "",
    postalCode: "",
    mapPoint: null,
  });
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
    setValues(formValuesFromUser(user));
  }, [user]);

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

  const phoneDisplay = user?.phone ? formatIranPhoneDisplay(user.phone) : "";
  const avatarSrc =
    avatarPreview ?? mediaFileUrl(user?.avatar.mediaId) ?? null;
  const displayName = useMemo(() => {
    if (values.fullName.trim()) return values.fullName.trim();
    return user?.code ?? t("title");
  }, [t, user?.code, values.fullName]);

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
      .then((asset) => accountProfile.updateMe({ avatar: { mediaId: asset.id } }))
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
    if (!built.ok) {
      setError(
        built.error === "postalCode"
          ? t("postalCodeHint")
          : tProfile("birthDateHint"),
      );
      return;
    }

    const input = { ...built.input };
    if (input.address?.provinceId && !isDiscoveryApiId(input.address.provinceId)) {
      delete input.address.provinceId;
    }

    setIsPending(true);
    try {
      const next = await accountProfile.updateMe(input);
      refreshUser(next);
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
    avatarSrc,
    displayName,
    isAvatarUploading,
    error,
    notice,
    isPending,
    patchValues,
    uploadAvatar,
    save,
  };
}
