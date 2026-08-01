"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { PLACEHOLDER_IMAGE } from "../placeholder";
import type { MediaImageProps } from "./MediaImage.types";

function resolveImageSrc(image: MediaImageProps["image"]) {
  if (typeof image !== "string") return null;
  const trimmed = image.trim();
  return trimmed.length > 0 ? trimmed : PLACEHOLDER_IMAGE;
}

export function MediaImage({
  image,
  alt = "",
  className,
  sizes = "100vw",
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
    <Image
      alt={alt}
      aria-hidden={ariaHidden}
      className={className}
      fill
      onError={() => {
        if (src !== PLACEHOLDER_IMAGE) {
          setSrc(PLACEHOLDER_IMAGE);
        }
      }}
      priority={priority}
      sizes={sizes}
      src={src}
    />
  );
}
