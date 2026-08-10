"use client";

import { useEffect, useState } from "react";
import { PLACEHOLDER_IMAGE } from "../placeholder";
import { useMediaImageAdapter } from "./MediaImage.adapter";
import type { MediaImageProps } from "./MediaImage.types";

function resolveImageSrc(image: MediaImageProps["image"]) {
  if (typeof image !== "string") return null;
  const trimmed = image.trim();
  return trimmed.length > 0 ? trimmed : PLACEHOLDER_IMAGE;
}

/**
 * Framework-agnostic media image.
 * Next apps wrap the tree with `MediaImageProvider` + `next/image`.
 * Without a provider (e.g. Vite admin), falls back to a plain `<img>`.
 */
export function MediaImage({
  image,
  alt = "",
  className,
  sizes,
  "aria-hidden": ariaHidden,
  priority,
}: MediaImageProps) {
  const Adapter = useMediaImageAdapter();
  const resolvedSrc = resolveImageSrc(image) ?? PLACEHOLDER_IMAGE;
  const [src, setSrc] = useState(resolvedSrc);

  useEffect(() => {
    setSrc(resolvedSrc);
  }, [resolvedSrc]);

  if (typeof image !== "string") {
    return (
      <div
        aria-hidden={ariaHidden ?? (alt ? undefined : true)}
        className={className}
      >
        {image}
      </div>
    );
  }

  const handleError = () => {
    if (src !== PLACEHOLDER_IMAGE) {
      setSrc(PLACEHOLDER_IMAGE);
    }
  };

  if (Adapter) {
    return (
      <Adapter
        alt={alt}
        aria-hidden={ariaHidden}
        className={className}
        priority={priority}
        sizes={sizes}
        src={src}
        onError={handleError}
      />
    );
  }

  return (
    <img
      alt={alt}
      aria-hidden={ariaHidden}
      className={className}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      src={src}
      onError={handleError}
    />
  );
}
