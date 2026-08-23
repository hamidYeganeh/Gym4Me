"use client";

import type { ProgressPhoto } from "@repo/api";
import { useCallback, useEffect, useState } from "react";
import { accountProgress } from "@/shared/lib/api";
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

  const mapPhoto = useCallback(
    (photo: ProgressPhoto): ProgressPhotoItem => ({
      id: photo.id,
      takenAtLabel: new Date(photo.capturedAt).toLocaleDateString("fa-IR"),
      note: photo.note ?? undefined,
      privacy: photo.privacy,
    }),
    [],
  );

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setPhotos(DEMO_MODE ? PROGRESS_PHOTOS : []);
      return;
    }

    let cancelled = false;
    accountProgress
      .listPhotos({ page_size: 100 })
      .then((page) => {
        if (!cancelled) setPhotos(page.result.map(mapPhoto));
      })
      .catch(() => {
        if (!cancelled) setPhotos(DEMO_MODE ? PROGRESS_PHOTOS : []);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady, mapPhoto]);

  const onAddPhoto = useCallback(async () => {
    if (!DEMO_MODE) return;
    setPending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setPhotos((current) => [createMockProgressPhoto(), ...current]);
    } finally {
      setPending(false);
    }
  }, []);

  return (
    <AthleteProgressPhotosScreen
      onAddPhoto={DEMO_MODE ? onAddPhoto : undefined}
      pending={pending}
      photos={photos}
    />
  );
}
