import { useState } from "react";
import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { Switch } from "@heroui/react/switch";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import type {
  BannerAspectRatio,
  BannerLinkKind,
  BannerOverlayPlacement,
  BannerRadius,
  BannerSlideInput,
} from "@repo/api";
import { Uploader } from "@repo/ui/kit/Uploader";
import { mediaApi } from "@/shared/lib/api";
import {
  BANNER_ASPECT_RATIOS,
  BANNER_LINK_KINDS,
  BANNER_OVERLAY_PLACEMENTS,
  BANNER_RADII,
} from "../../lib/banner-constants";
import { bannerSlidesFieldVariants } from "./BannerSlidesField.styles";
import type { BannerSlidesFieldProps } from "./BannerSlidesField.types";

const IMAGE_ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
} as const;

const DEFAULT_SLIDE: Omit<BannerSlideInput, "mediaId"> = {
  linkKind: "none",
  gradient: false,
  ratio: "16/9",
  radius: "surface",
};

const MAX_SLIDES = 10;

function overlayPositionClass(placement: BannerOverlayPlacement) {
  const positions: Record<BannerOverlayPlacement, string> = {
    "top-start": "top-3 start-3",
    "top-center": "top-3 left-1/2 -translate-x-1/2",
    "top-end": "top-3 end-3",
    "center-start": "top-1/2 start-3 -translate-y-1/2",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    "center-end": "top-1/2 end-3 -translate-y-1/2",
    "bottom-start": "bottom-3 start-3",
    "bottom-center": "bottom-3 left-1/2 -translate-x-1/2",
    "bottom-end": "bottom-3 end-3",
  };
  return positions[placement];
}

function previewRatioClass(ratio: BannerAspectRatio) {
  return {
    "16/9": "aspect-video",
    "2/1": "aspect-[2/1]",
    "4/3": "aspect-[4/3]",
    "1/1": "aspect-square",
  }[ratio];
}

function previewRadiusClass(radius: BannerRadius) {
  return {
    none: "rounded-none",
    sm: "rounded-sm",
    field: "rounded-xl",
    compact: "rounded-2xl",
    auth: "rounded-3xl",
    surface: "rounded-[2rem]",
    full: "rounded-[999px]",
  }[radius];
}

export function BannerSlidesField({
  value,
  onChange,
  labels,
  disabled,
}: BannerSlidesFieldProps) {
  const styles = bannerSlidesFieldVariants();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);

  const patchSlide = (index: number, patch: Partial<BannerSlideInput>) => {
    onChange(
      value.map((slide, i) => (i === index ? { ...slide, ...patch } : slide)),
    );
  };

  const removeSlide = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const uploadSlides = async (files: File[]) => {
    setUploading(true);
    setUploadError(false);
    try {
      const assets = await Promise.all(
        files.map((file) => mediaApi.upload(file)),
      );
      onChange([
        ...value,
        ...assets.map((asset): BannerSlideInput => ({
          mediaId: asset.id,
          ...DEFAULT_SLIDE,
        })),
      ]);
    } catch {
      setUploadError(true);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.root()}>
      <Typography className={styles.label()}>{labels.label}</Typography>
      {labels.hint ? (
        <Typography className={styles.hint()}>{labels.hint}</Typography>
      ) : null}

      {value.length === 0 ? (
        <Typography className={styles.empty()}>{labels.empty}</Typography>
      ) : (
        <div className={styles.list()}>
          {value.map((slide, index) => (
            <div className={styles.slide()} key={`${slide.mediaId}-${index}`}>
              <div className={styles.slideHeader()}>
                <div
                  className={`${styles.preview()} ${previewRatioClass(
                    slide.ratio ?? "16/9",
                  )} ${previewRadiusClass(slide.radius ?? "surface")}`}
                >
                  <img
                    alt={slide.alt ?? ""}
                    className={styles.image()}
                    src={mediaApi.fileUrl(slide.mediaId)}
                  />
                  {slide.gradient ? (
                    <div aria-hidden className={styles.previewGradient()} />
                  ) : null}
                  {slide.title?.text ? (
                    <strong
                      className={`${styles.previewTitle()} ${overlayPositionClass(
                        slide.title.placement ?? "bottom-start",
                      )}`}
                    >
                      {slide.title.text}
                    </strong>
                  ) : null}
                  {slide.action?.label ? (
                    <span
                      className={`${styles.previewAction()} ${overlayPositionClass(
                        slide.action.placement ?? "bottom-end",
                      )}`}
                    >
                      {slide.action.label}
                    </span>
                  ) : null}
                </div>
                <Button
                  isDisabled={disabled}
                  size="sm"
                  variant="danger"
                  onPress={() => removeSlide(index)}
                >
                  {labels.remove}
                </Button>
              </div>

              <div className={styles.fields()}>
                <div className={styles.field()}>
                  <Label>{labels.linkKindLabel}</Label>
                  <div className={styles.chips()}>
                    {BANNER_LINK_KINDS.map((kind) => (
                      <Button
                        isDisabled={disabled}
                        key={kind}
                        size="sm"
                        variant={
                          (slide.linkKind ?? "none") === kind
                            ? "primary"
                            : "secondary"
                        }
                        onPress={() =>
                          patchSlide(index, {
                            linkKind: kind as BannerLinkKind,
                            linkUrl:
                              kind === "none" ? undefined : slide.linkUrl,
                          })
                        }
                      >
                        {labels.linkKinds[kind]}
                      </Button>
                    ))}
                  </div>
                </div>

                {(slide.linkKind ?? "none") !== "none" ? (
                  <TextField
                    className={styles.field()}
                    fullWidth
                    isDisabled={disabled}
                    name={`slide-${index}-linkUrl`}
                    value={slide.linkUrl ?? ""}
                    onChange={(next) => patchSlide(index, { linkUrl: next })}
                  >
                    <Label>{labels.linkUrlLabel}</Label>
                    <Input
                      dir="ltr"
                      placeholder={
                        slide.linkKind === "external"
                          ? labels.linkUrlExternalHint
                          : labels.linkUrlInternalHint
                      }
                    />
                  </TextField>
                ) : null}

                <TextField
                  className={styles.field()}
                  fullWidth
                  isDisabled={disabled}
                  name={`slide-${index}-alt`}
                  value={slide.alt ?? ""}
                  onChange={(next) =>
                    patchSlide(index, { alt: next || undefined })
                  }
                >
                  <Label>{labels.altLabel}</Label>
                  <Input />
                </TextField>

                <div className={styles.fieldRow()}>
                  <Label>{labels.gradientLabel}</Label>
                  <Switch
                    isDisabled={disabled}
                    isSelected={slide.gradient ?? false}
                    onChange={(selected) =>
                      patchSlide(index, { gradient: selected })
                    }
                  >
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch>
                </div>

                <div className={styles.field()}>
                  <Label>{labels.ratioLabel}</Label>
                  <div className={styles.chips()}>
                    {BANNER_ASPECT_RATIOS.map((ratio) => (
                      <Button
                        isDisabled={disabled}
                        key={ratio}
                        size="sm"
                        variant={
                          (slide.ratio ?? "16/9") === ratio
                            ? "primary"
                            : "secondary"
                        }
                        onPress={() =>
                          patchSlide(index, {
                            ratio: ratio as BannerAspectRatio,
                          })
                        }
                      >
                        {labels.ratios[ratio]}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className={styles.field()}>
                  <Label>{labels.radiusLabel}</Label>
                  <div className={styles.chips()}>
                    {BANNER_RADII.map((radius) => (
                      <Button
                        isDisabled={disabled}
                        key={radius}
                        size="sm"
                        variant={
                          (slide.radius ?? "surface") === radius
                            ? "primary"
                            : "secondary"
                        }
                        onPress={() =>
                          patchSlide(index, {
                            radius: radius as BannerRadius,
                          })
                        }
                      >
                        {labels.radii[radius]}
                      </Button>
                    ))}
                  </div>
                </div>

                <TextField
                  className={styles.field()}
                  fullWidth
                  isDisabled={disabled}
                  name={`slide-${index}-title`}
                  value={slide.title?.text ?? ""}
                  onChange={(next) =>
                    patchSlide(index, {
                      title: next.trim()
                        ? {
                            text: next,
                            placement: slide.title?.placement ?? "bottom-start",
                          }
                        : undefined,
                    })
                  }
                >
                  <Label>{labels.titleTextLabel}</Label>
                  <Input />
                </TextField>

                {slide.title?.text ? (
                  <div className={styles.field()}>
                    <Label>{labels.titlePlacementLabel}</Label>
                    <div className={styles.placementGrid()}>
                      {BANNER_OVERLAY_PLACEMENTS.map((placement) => (
                        <Button
                          isDisabled={disabled}
                          key={`title-${placement}`}
                          size="sm"
                          className={styles.placementButton()}
                          variant={
                            (slide.title?.placement ?? "bottom-start") ===
                            placement
                              ? "primary"
                              : "secondary"
                          }
                          onPress={() =>
                            patchSlide(index, {
                              title: {
                                text: slide.title?.text ?? "",
                                placement: placement as BannerOverlayPlacement,
                              },
                            })
                          }
                        >
                          {labels.overlayPlacements[placement]}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <TextField
                  className={styles.field()}
                  fullWidth
                  isDisabled={disabled}
                  name={`slide-${index}-action`}
                  value={slide.action?.label ?? ""}
                  onChange={(next) =>
                    patchSlide(index, {
                      action: next.trim()
                        ? {
                            label: next,
                            placement: slide.action?.placement ?? "bottom-end",
                          }
                        : undefined,
                    })
                  }
                >
                  <Label>{labels.actionLabelLabel}</Label>
                  <Input />
                </TextField>

                {slide.action?.label ? (
                  <div className={styles.field()}>
                    <Label>{labels.actionPlacementLabel}</Label>
                    <div className={styles.placementGrid()}>
                      {BANNER_OVERLAY_PLACEMENTS.map((placement) => (
                        <Button
                          isDisabled={disabled}
                          key={`action-${placement}`}
                          size="sm"
                          className={styles.placementButton()}
                          variant={
                            (slide.action?.placement ?? "bottom-end") ===
                            placement
                              ? "primary"
                              : "secondary"
                          }
                          onPress={() =>
                            patchSlide(index, {
                              action: {
                                label: slide.action?.label ?? "",
                                placement: placement as BannerOverlayPlacement,
                              },
                            })
                          }
                        >
                          {labels.overlayPlacements[placement]}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <Uploader
        accept={IMAGE_ACCEPT}
        buttonLabel={labels.uploaderButtonLabel}
        description={labels.uploaderDescription}
        disabled={disabled || uploading || value.length >= MAX_SLIDES}
        maxFiles={Math.max(1, MAX_SLIDES - value.length)}
        multiple
        title={labels.uploaderTitle}
        onDropAccepted={(files) => {
          if (files.length > 0) void uploadSlides(files);
        }}
      />

      {uploadError ? (
        <Typography className={styles.uploadError()} role="alert">
          {labels.uploadError}
        </Typography>
      ) : null}
    </div>
  );
}
