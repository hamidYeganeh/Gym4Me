"use client";

import { useCallback, useRef, useState } from "react";
import type { ImageCropperRequest } from "./ImageCropperSheet.types";

export function useImageCropper() {
  const [request, setRequest] = useState<ImageCropperRequest | null>(null);
  const resolver = useRef<((file: File | null) => void) | null>(null);

  const cropImage = useCallback((file: File, aspect = 1) => {
    if (!file.type.startsWith("image/")) return Promise.resolve(file);
    resolver.current?.(null);
    setRequest({ file, aspect });
    return new Promise<File | null>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const finish = useCallback((file: File | null) => {
    resolver.current?.(file);
    resolver.current = null;
    setRequest(null);
  }, []);

  return {
    cropImage,
    cropperProps: {
      request,
      onCancel: () => finish(null),
      onConfirm: (file: File) => finish(file),
    },
  };
}
