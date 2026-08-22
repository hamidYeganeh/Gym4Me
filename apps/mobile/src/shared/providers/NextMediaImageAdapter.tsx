"use client";

import Image from "next/image";
import type { MediaImageAdapterProps } from "@repo/ui/common/MediaImage";

function usesFillLayout(className?: string) {
  if (!className) return false;
  return /\babsolute\b/.test(className) || /\binset-0\b/.test(className);
}

/**
 * Drop-in `next/image` adapter for `@repo/ui` MediaImage.
 * Cover/absolute classNames use `fill` so the photo actually occupies the
 * positioned parent (Swiper slides, hero shells). Other callers keep width/height.
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
  const fill = usesFillLayout(className);

  if (fill) {
    return (
      <Image
        fill
        alt={alt}
        aria-hidden={ariaHidden}
        className={className}
        priority={priority}
        sizes={sizes ?? "100vw"}
        src={src}
        onError={onError}
      />
    );
  }

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
