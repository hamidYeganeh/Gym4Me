"use client";

import { ToggleButton } from "@heroui/react";
import { MediaImage } from "../../common/MediaImage";
import { getBodyTypeArt } from "./art";
import { bodyTypeCardVariants } from "./BodyTypeCard.styles";
import type { BodyTypeCardProps } from "./BodyTypeCard.types";

export function BodyTypeCard({
  bodyType = "mesomorph",
  gender = "male",
  image,
  actionLabel,
  className,
  imageClassName,
  ...props
}: BodyTypeCardProps) {
  const slots = bodyTypeCardVariants();
  const hasCustomImage = image != null && image !== "";
  const artSvg = !hasCustomImage ? getBodyTypeArt(bodyType, gender) : null;

  return (
    <ToggleButton
      {...props}
      aria-label={actionLabel}
      className={slots.root({ className })}
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
