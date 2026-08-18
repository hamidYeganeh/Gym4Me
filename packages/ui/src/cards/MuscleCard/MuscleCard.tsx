"use client";

import { ToggleButton } from "@heroui/react/toggle-button";
import { MediaImage } from "../../common/MediaImage";
import { getMuscleArt } from "./art";
import { muscleCardVariants } from "./MuscleCard.styles";
import type { MuscleCardProps } from "./MuscleCard.types";

export function MuscleCard({
  bodyArea = "abs",
  gender = "male",
  image,
  actionLabel,
  className,
  imageClassName,
  ...props
}: MuscleCardProps) {
  const slots = muscleCardVariants();
  const hasCustomImage = image != null && image !== "";
  const artSvg = !hasCustomImage ? getMuscleArt(bodyArea, gender) : null;

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
              sizes="88px"
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
