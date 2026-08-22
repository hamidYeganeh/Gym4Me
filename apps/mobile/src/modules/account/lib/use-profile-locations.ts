"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "@repo/api";
import type { FavouriteLocation } from "@repo/api";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { accountProfile } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
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

function formErrorMessage(
  error: FavouriteLocationFormError,
  t: (key: "labelRequired" | "postalCodeHint" | "contentRequired") => string,
) {
  if (error === "label") return t("labelRequired");
  if (error === "postalCode") return t("postalCodeHint");
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

export function useProfileLocations() {
  const t = useTranslations("Mobile.ProfileLocations");
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  const [items, setItems] = useState<FavouriteLocation[]>([]);
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
    const built = editingId
      ? buildFavouriteLocationUpdateInput(values)
      : buildFavouriteLocationInput(values);
    if (!built.ok) {
      setFormError(formErrorMessage(built.error, t));
      return false;
    }

    setIsPending(true);
    setFormError(null);
    try {
      if (editingId) {
        await accountProfile.updateFavouriteLocation(editingId, built.input);
      } else {
        await accountProfile.createFavouriteLocation(built.input);
      }
      const next = await accountProfile.listFavouriteLocations();
      setItems(next.items);
      await syncUser();
      setMode("list");
      setEditingId(null);
      return true;
    } catch (err) {
      setFormError(apiErrorMessage(err, t("errorSave"), t("kindTaken"), t("limitReached")));
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
      setFormError(apiErrorMessage(err, t("errorDelete"), t("kindTaken"), t("limitReached")));
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [editingId, syncUser, t]);

  const atLimit = items.length >= MAX_FAVOURITE_LOCATIONS && !editingId;

  return useMemo(
    () => ({
      items,
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
      closeForm,
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
      remove,
      save,
      values,
    ],
  );
}
