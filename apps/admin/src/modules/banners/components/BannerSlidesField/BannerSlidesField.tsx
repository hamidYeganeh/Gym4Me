import { useState } from "react";
import { Button, Input, Label, TextField, Typography } from "@heroui/react";
import type { BannerLinkKind, BannerSlideInput } from "@repo/api";
import { Uploader } from "@repo/ui/kit/Uploader";
import { mediaApi } from "@/shared/lib/api";
import { BANNER_LINK_KINDS } from "../../lib/banner-constants";
import { bannerSlidesFieldVariants } from "./BannerSlidesField.styles";
import type { BannerSlidesFieldProps } from "./BannerSlidesField.types";

const IMAGE_ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
} as const;

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
        ...assets.map(
          (asset): BannerSlideInput => ({
            mediaId: asset.id,
            linkKind: "none",
          }),
        ),
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
      {labels.hint ? <p className={styles.hint()}>{labels.hint}</p> : null}

      {value.length === 0 ? (
        <p className={styles.empty()}>{labels.empty}</p>
      ) : (
        <div className={styles.list()}>
          {value.map((slide, index) => (
            <div className={styles.slide()} key={`${slide.mediaId}-${index}`}>
              <div className={styles.slideHeader()}>
                <div className={styles.preview()}>
                  <img
                    alt={slide.alt ?? ""}
                    className={styles.image()}
                    src={mediaApi.fileUrl(slide.mediaId)}
                  />
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
              </div>
            </div>
          ))}
        </div>
      )}

      <Uploader
        accept={IMAGE_ACCEPT}
        buttonLabel={labels.uploaderButtonLabel}
        description={labels.uploaderDescription}
        disabled={disabled || uploading}
        multiple
        title={labels.uploaderTitle}
        onDropAccepted={(files) => {
          if (files.length > 0) void uploadSlides(files);
        }}
      />

      {uploadError ? (
        <p className={styles.uploadError()} role="alert">
          {labels.uploadError}
        </p>
      ) : null}
    </div>
  );
}
