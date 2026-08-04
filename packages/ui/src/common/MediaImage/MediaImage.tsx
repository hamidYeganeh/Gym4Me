"use client";

import { useEffect, useState } from "react";
import { PLACEHOLDER_IMAGE } from "../placeholder";
import type { MediaImageProps } from "./MediaImage.types";

function resolveImageSrc(image: MediaImageProps["image"]) {
  if (typeof image !== "string") return null;
  const trimmed = image.trim();
  return trimmed.length > 0 ? trimmed : PLACEHOLDER_IMAGE;
}

/**
 * Framework-agnostic media image.
 * Uses a plain `<img>` so Vite (admin) and Next (mobile/website) share one implementation.
 * Parents that need fill behavior should wrap with `relative` and pass size classes.
 */
export function MediaImage({
  image,
  alt = "",
  className,
  "aria-hidden": ariaHidden,
  priority,
}: MediaImageProps) {
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

  return (
    <img
      alt={alt}
      aria-hidden={ariaHidden}
      className={className}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      onError={() => {
        if (src !== PLACEHOLDER_IMAGE) {
          setSrc(PLACEHOLDER_IMAGE);
        }
      }}
      src={src}
    />
  );
}
