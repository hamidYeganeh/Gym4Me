"use client";

import { useCallback, useState } from "react";
import { AthleteProgressPhotosScreen } from "../screens/AthleteProgressPhotosScreen";
import {
  PROGRESS_PHOTOS,
  createMockProgressPhoto,
  type ProgressPhotoItem,
} from "./progress-photos-data";

export function AthleteProgressPhotosGate() {
  const [photos, setPhotos] = useState<ProgressPhotoItem[]>(PROGRESS_PHOTOS);
  const [pending, setPending] = useState(false);

  const onAddPhoto = useCallback(async () => {
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
      onAddPhoto={onAddPhoto}
      pending={pending}
      photos={photos}
    />
  );
}
