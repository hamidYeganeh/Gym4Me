"use client";

import Image from "next/image";
import type { MediaImageAdapterProps } from "@repo/ui/common/MediaImage";

/**
 * Drop-in `next/image` adapter for `@repo/ui` MediaImage.
 * Width/height satisfy Next’s API; layout is still driven by consumer `className`
 * (e.g. absolute inset-0 object-cover, or max-h / object-contain).
 */
export function NextMediaImageAdapter({
  src,
  alt,
  className,
  sizes,
  priority,
  "aria-hidden": ariaHidden,
  onError,
}: MediaImageAdapterProps) {
  return (
    <Image
      alt={alt}
      aria-hidden={ariaHidden}
      className={className}
      height={800}
      priority={priority}
      sizes={sizes ?? "100vw"}
      src={src}
      width={1200}
      onError={onError}
    />
  );
}
