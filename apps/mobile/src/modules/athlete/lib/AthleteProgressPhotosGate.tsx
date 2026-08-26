"use client";

import type { ProgressPhoto } from "@repo/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { accountProgress, mediaApi } from "@/shared/lib/api";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteProgressPhotosScreen } from "../screens/AthleteProgressPhotosScreen";
import {
  PROGRESS_PHOTOS,
  createMockProgressPhoto,
  type ProgressPhotoItem,
} from "./progress-photos-data";

export function AthleteProgressPhotosGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [photos, setPhotos] = useState<ProgressPhotoItem[]>(
    DEMO_MODE ? PROGRESS_PHOTOS : [],
  );
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(!DEMO_MODE);
  const [error, setError] = useState(false);
  const [pendingPhotoId, setPendingPhotoId] = useState<string | null>(null);
  const objectUrls = useRef(new Set<string>());
  const [reloadKey, setReloadKey] = useState(0);

  const mapPhoto = useCallback(
    (photo: ProgressPhoto): ProgressPhotoItem => ({
      id: photo.id,
      takenAtLabel: new Date(photo.capturedAt).toLocaleDateString("fa-IR"),
      note: photo.note ?? undefined,
      privacy: photo.privacy,
    }),
    [],
  );

  const mapPhotoWithImage = useCallback(
    async (photo: ProgressPhoto): Promise<ProgressPhotoItem> => {
      const blob = await mediaApi.download(photo.mediaId);
      const imageUrl = URL.createObjectURL(blob);
      objectUrls.current.add(imageUrl);
      return { ...mapPhoto(photo), imageUrl };
    },
    [mapPhoto],
  );

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setPhotos(DEMO_MODE ? PROGRESS_PHOTOS : []);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);
    accountProgress
      .listPhotos({ page_size: 100 })
      .then((page) => {
        return Promise.all(page.result.map(mapPhotoWithImage));
      })
      .then((items) => {
        if (!cancelled) setPhotos(items);
      })
      .catch(() => {
        if (!cancelled) {
          setPhotos(DEMO_MODE ? PROGRESS_PHOTOS : []);
          setError(!DEMO_MODE);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady, mapPhotoWithImage, reloadKey]);

  useEffect(
    () => () => {
      for (const url of objectUrls.current) URL.revokeObjectURL(url);
      objectUrls.current.clear();
    },
    [],
  );

  const onAddPhoto = useCallback(async (file: File) => {
    setPending(true);
    setError(false);
    try {
      if (DEMO_MODE) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setPhotos((current) => [createMockProgressPhoto(), ...current]);
        return;
      }
      const uploaded = await mediaApi.upload(file, file.name, {
        visibility: "private",
        purpose: "progress_photo",
      });
      const photo = await accountProgress.createPhoto({
        mediaId: uploaded.id,
        capturedAt: new Date().toISOString(),
        privacy: "private",
      });
      const imageUrl = URL.createObjectURL(file);
      objectUrls.current.add(imageUrl);
      setPhotos((current) => [{ ...mapPhoto(photo), imageUrl }, ...current]);
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }, [mapPhoto]);

  const onPrivacyChange = useCallback(
    async (id: string, privacy: ProgressPhotoItem["privacy"]) => {
      setPendingPhotoId(id);
      setError(false);
      try {
        const updated = await accountProgress.updatePhoto(id, { privacy });
        setPhotos((current) =>
          current.map((photo) =>
            photo.id === id ? { ...photo, privacy: updated.privacy } : photo,
          ),
        );
      } catch {
        setError(true);
      } finally {
        setPendingPhotoId(null);
      }
    },
    [],
  );

  const onDeletePhoto = useCallback(async (id: string) => {
    setPendingPhotoId(id);
    setError(false);
    try {
      await accountProgress.deletePhoto(id);
      setPhotos((current) => {
        const removed = current.find((photo) => photo.id === id);
        if (removed?.imageUrl) {
          URL.revokeObjectURL(removed.imageUrl);
          objectUrls.current.delete(removed.imageUrl);
        }
        return current.filter((photo) => photo.id !== id);
      });
    } catch {
      setError(true);
    } finally {
      setPendingPhotoId(null);
    }
  }, []);

  return (
    <AthleteProgressPhotosScreen
      error={error}
      loading={loading}
      onAddPhoto={isAuthenticated ? onAddPhoto : undefined}
      onDeletePhoto={isAuthenticated ? onDeletePhoto : undefined}
      onPrivacyChange={isAuthenticated ? onPrivacyChange : undefined}
      pending={pending}
      pendingPhotoId={pendingPhotoId}
      photos={photos}
      onRetry={() => setReloadKey((value) => value + 1)}
    />
  );
}
