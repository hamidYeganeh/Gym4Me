"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "@repo/api";
import type {
  CreateFavouriteLocationInput,
  FavouriteLocation,
  UpdateFavouriteLocationInput,
} from "@repo/api";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  accountProfile,
  basicsLocations,
  isDiscoveryApiId,
} from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import type { ProfileProvinceOption } from "./profile-settings";
import {
  buildFavouriteLocationInput,
  buildFavouriteLocationUpdateInput,
  emptyFavouriteLocationFormValues,
  formValuesFromFavouriteLocation,
  MAX_FAVOURITE_LOCATIONS,
  type FavouriteLocationFormError,
  type FavouriteLocationFormValues,
} from "./profile-locations";

export type ProfileLocationsMode = "list" | "form";

export type ProfileLocationOption = {
  id: string;
  name: string;
};

function formErrorMessage(
  error: FavouriteLocationFormError,
  t: (key: "labelRequired" | "contentRequired") => string,
) {
  if (error === "label") return t("labelRequired");
  return t("contentRequired");
}

function apiErrorMessage(
  err: unknown,
  fallback: string,
  kindTaken: string,
  limitReached: string,
) {
  if (!(err instanceof ApiError)) return fallback;
  const message = Array.isArray(err.message)
    ? err.message[0]
    : typeof err.message === "string"
      ? err.message
      : fallback;
  if (typeof message === "string" && message.includes("already saved")) {
    return kindTaken;
  }
  if (typeof message === "string" && message.includes("at most")) {
    return limitReached;
  }
  return typeof message === "string" && message.trim() ? message : fallback;
}

function sanitizeLocationInput<
  T extends CreateFavouriteLocationInput | UpdateFavouriteLocationInput,
>(input: T): T {
  if (!input.address) return input;
  const address = { ...input.address };
  if (address.provinceId && !isDiscoveryApiId(address.provinceId)) {
    delete address.provinceId;
  }
  return { ...input, address };
}

export function useProfileLocations() {
  const t = useTranslations("Mobile.ProfileLocations");
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  const [items, setItems] = useState<FavouriteLocation[]>([]);
  const [provinces, setProvinces] = useState<ProfileProvinceOption[]>([]);
  const [cities, setCities] = useState<ProfileLocationOption[]>([]);
  const [districts, setDistricts] = useState<ProfileLocationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ProfileLocationsMode>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<FavouriteLocationFormValues>(
    emptyFavouriteLocationFormValues(),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const syncUser = useCallback(async () => {
    const next = await accountProfile.getMe();
    refreshUser(next);
    return next;
  }, [refreshUser]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await accountProfile.listFavouriteLocations();
      setItems(result.items);
    } catch (err) {
      setItems([]);
      setError(err instanceof ApiError ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

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
    if (mode !== "form") {
      setCities([]);
      setDistricts([]);
      return;
    }
    const provinceId = values.address.provinceId;
    if (!provinceId || !isDiscoveryApiId(provinceId)) {
      setCities([]);
      setDistricts([]);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const page = await basicsLocations.listCities(provinceId);
        if (cancelled) return;
        const next = page.result.map((item) => ({
          id: item.id,
          name: item.name,
        }));
        setCities(next);
        setValues((current) => {
          if (
            current.cityId &&
            next.some((item) => item.id === current.cityId)
          ) {
            return current;
          }
          const byName = next.find(
            (item) => item.name === current.address.city.trim(),
          );
          if (!byName) {
            return current.cityId
              ? { ...current, cityId: null, districtId: null }
              : current;
          }
          return { ...current, cityId: byName.id };
        });
      } catch {
        if (!cancelled) setCities([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, values.address.provinceId]);

  useEffect(() => {
    if (mode !== "form") {
      setDistricts([]);
      return;
    }
    const cityId = values.cityId;
    if (!cityId || !isDiscoveryApiId(cityId)) {
      setDistricts([]);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const page = await basicsLocations.listDistricts(cityId);
        if (cancelled) return;
        const next = page.result.map((item) => ({
          id: item.id,
          name: item.name,
        }));
        setDistricts(next);
        setValues((current) => {
          if (
            current.districtId &&
            next.some((item) => item.id === current.districtId)
          ) {
            return current;
          }
          const byName = next.find(
            (item) => item.name === current.address.district.trim(),
          );
          if (!byName) {
            return current.districtId
              ? { ...current, districtId: null }
              : current;
          }
          return { ...current, districtId: byName.id };
        });
      } catch {
        if (!cancelled) setDistricts([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, values.cityId]);

  const openCreate = useCallback(() => {
    setEditingId(null);
    setValues(emptyFavouriteLocationFormValues());
    setFormError(null);
    setMode("form");
  }, []);

  const openEdit = useCallback((item: FavouriteLocation) => {
    setEditingId(item.id);
    setValues(formValuesFromFavouriteLocation(item));
    setFormError(null);
    setMode("form");
  }, []);

  const closeForm = useCallback(() => {
    if (isPending || isDeleting) return;
    setMode("list");
    setEditingId(null);
    setFormError(null);
  }, [isDeleting, isPending]);

  useEffect(() => {
    if (loading) return;
    const createRequested = searchParams.get("create") === "1";
    const editId = searchParams.get("id");
    if (createRequested) {
      openCreate();
      return;
    }
    if (editId) {
      const match = items.find((item) => item.id === editId);
      if (match) openEdit(match);
    }
  }, [items, loading, openCreate, openEdit, searchParams]);

  const patchValues = useCallback(
    (patch: Partial<FavouriteLocationFormValues>) => {
      setValues((current) => ({
        ...current,
        ...patch,
        address: patch.address
          ? { ...current.address, ...patch.address }
          : current.address,
      }));
    },
    [],
  );

  const save = useCallback(async () => {
    let saveLocation: () => Promise<unknown>;
    if (editingId) {
      const built = buildFavouriteLocationUpdateInput(values);
      if (!built.ok) {
        setFormError(formErrorMessage(built.error, t));
        return false;
      }
      const input = sanitizeLocationInput(built.input);
      saveLocation = () =>
        accountProfile.updateFavouriteLocation(editingId, input);
    } else {
      const built = buildFavouriteLocationInput(values);
      if (!built.ok) {
        setFormError(formErrorMessage(built.error, t));
        return false;
      }
      const input = sanitizeLocationInput(built.input);
      saveLocation = () => accountProfile.createFavouriteLocation(input);
    }

    setIsPending(true);
    setFormError(null);
    try {
      await saveLocation();
      const next = await accountProfile.listFavouriteLocations();
      setItems(next.items);
      await syncUser();
      setMode("list");
      setEditingId(null);
      return true;
    } catch (err) {
      setFormError(
        apiErrorMessage(err, t("errorSave"), t("kindTaken"), t("limitReached")),
      );
      return false;
    } finally {
      setIsPending(false);
    }
  }, [editingId, syncUser, t, values]);

  const remove = useCallback(async () => {
    if (!editingId) return false;
    setIsDeleting(true);
    setFormError(null);
    try {
      const next = await accountProfile.deleteFavouriteLocation(editingId);
      setItems(next.items);
      await syncUser();
      setMode("list");
      setEditingId(null);
      return true;
    } catch (err) {
      setFormError(
        apiErrorMessage(
          err,
          t("errorDelete"),
          t("kindTaken"),
          t("limitReached"),
        ),
      );
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [editingId, syncUser, t]);

  const atLimit = items.length >= MAX_FAVOURITE_LOCATIONS && !editingId;

  return useMemo(
    () => ({
      items,
      provinces,
      cities,
      districts,
      loading,
      error,
      mode,
      editingId,
      values,
      formError,
      isPending,
      isDeleting,
      atLimit,
      load,
      openCreate,
      openEdit,
      closeForm,
      patchValues,
      save,
      remove,
    }),
    [
      atLimit,
      cities,
      closeForm,
      districts,
      editingId,
      error,
      formError,
      isDeleting,
      isPending,
      items,
      load,
      loading,
      mode,
      openCreate,
      openEdit,
      patchValues,
      provinces,
      remove,
      save,
      values,
    ],
  );
}
