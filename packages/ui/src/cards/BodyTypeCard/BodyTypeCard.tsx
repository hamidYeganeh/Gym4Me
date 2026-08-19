"use client";

import { ToggleButton } from "@heroui/react/toggle-button";
import { MediaImage } from "../../common/MediaImage";
import { getBodyTypeArt } from "./art";
import { bodyTypeCardVariants } from "./BodyTypeCard.styles";
import type { BodyTypeCardProps } from "./BodyTypeCard.types";

const ACTIVE_ART_VARS = {
  "--body-type-body": "#DBEAFE",
  "--body-type-body-soft": "#EFF6FF",
  "--body-type-stroke": "#2563EB",
} as const;

export function BodyTypeCard({
  bodyType = "mesomorph",
  gender = "male",
  image,
  actionLabel,
  className,
  imageClassName,
  isSelected = false,
  style,
  ...props
}: BodyTypeCardProps) {
  const slots = bodyTypeCardVariants({ selected: isSelected });
  const hasCustomImage = image != null && image !== "";
  const artSvg = !hasCustomImage ? getBodyTypeArt(bodyType, gender) : null;

  return (
    <ToggleButton
      {...props}
      aria-label={actionLabel}
      className={slots.root({ className })}
      isSelected={isSelected}
      style={{
        ...(isSelected ? ACTIVE_ART_VARS : null),
        ...style,
      }}
      variant="ghost"
    >
      <span className={slots.media()}>
        {hasCustomImage ? (
          typeof image === "string" ? (
            <MediaImage
              alt=""
              aria-hidden
              className={slots.image({ className: imageClassName })}
              image={image}
              sizes="130px"
            />
          ) : (
            <span
              aria-hidden
              className={slots.image({ className: imageClassName })}
            >
              {image}
            </span>
          )
        ) : (
          <span
            aria-hidden
            className={slots.art({ className: imageClassName })}
            dangerouslySetInnerHTML={
              artSvg != null ? { __html: artSvg } : undefined
            }
          />
        )}
      </span>
    </ToggleButton>
  );
}
