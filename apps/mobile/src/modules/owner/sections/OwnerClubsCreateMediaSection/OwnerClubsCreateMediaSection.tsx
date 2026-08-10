"use client";

import { useState } from "react";
import { Controller, useFieldArray, useWatch } from "react-hook-form";
import { Typography } from "@heroui/react";
import { ApiError } from "@repo/api";
import { FileItem, type FileItemStatus } from "@repo/ui/kit/FileItem";
import { Uploader } from "@repo/ui/kit/Uploader";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { mediaApi, mediaFileUrl } from "@/shared/lib/api";
import { ownerClubsCreateMediaSectionVariants } from "./OwnerClubsCreateMediaSection.styles";
import type { OwnerClubsCreateMediaSectionProps } from "./OwnerClubsCreateMediaSection.types";

const IMAGE_ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
} as const;

type UploadState = {
  fileName: string;
  fileSize: string;
  status: FileItemStatus;
  progress: number;
  file: File | null;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function OwnerClubsCreateMediaSection({
  control,
  setValue,
  className,
}: OwnerClubsCreateMediaSectionProps) {
  const t = useTranslations("Mobile.ClubCreate");
  const styles = ownerClubsCreateMediaSectionVariants();
  const gallery = useFieldArray({ control, name: "gallery" });
  const coverMediaId = useWatch({ control, name: "coverMediaId" });
  const coverFileName = useWatch({ control, name: "coverFileName" });

  const [coverUpload, setCoverUpload] = useState<UploadState | null>(null);
  const [galleryUploads, setGalleryUploads] = useState<
    Record<string, UploadState>
  >({});

  return (
    <section className={styles.root({ className })}>
      <div className={styles.header()}>
        <Typography className={styles.title()} type="h4" weight="bold">
          {t("stepMedia")}
        </Typography>
        <Typography className={styles.hint()} type="body-sm">
          {t("stepMediaHint")}
        </Typography>
      </div>

      <Controller
        control={control}
        name="coverMediaId"
        render={({ field }) => {
          const showUploader =
            !field.value &&
            (!coverUpload || coverUpload.status === "error");
          const showItem =
            Boolean(field.value) ||
            (coverUpload != null &&
              (coverUpload.status === "uploading" ||
                coverUpload.status === "success" ||
                coverUpload.status === "error"));
          const displayName =
            coverUpload?.fileName ??
            coverFileName ??
            (field.value ? "cover.jpg" : null);
          const previewUrl = mediaFileUrl(field.value);

          return (
            <div className={styles.group()}>
              <Typography
                className={styles.groupTitle()}
                type="body"
                weight="semibold"
              >
                {t("cover")}
              </Typography>
              <Typography className={styles.hint()} type="body-sm">
                {t("coverHint")}
              </Typography>

              <div className={styles.stack()}>
                {showUploader ? (
                  <Uploader
                    accept={IMAGE_ACCEPT}
                    buttonLabel={t("uploaderButton")}
                    description={t("uploaderDescription")}
                    maxFiles={1}
                    multiple={false}
                    title={t("uploaderTitle")}
                    onDropAccepted={(files) => {
                      const file = files[0];
                      if (!file) return;
                      setCoverUpload({
                        fileName: file.name,
                        fileSize: formatBytes(file.size),
                        status: "uploading",
                        progress: 35,
                        file,
                      });
                      void mediaApi
                        .upload(file)
                        .then((asset) => {
                          setCoverUpload({
                            fileName: file.name,
                            fileSize: formatBytes(file.size),
                            status: "success",
                            progress: 100,
                            file,
                          });
                          field.onChange(asset.id);
                          setValue("coverFileName", file.name);
                        })
                        .catch(() => {
                          setCoverUpload({
                            fileName: file.name,
                            fileSize: formatBytes(file.size),
                            status: "error",
                            progress: 65,
                            file,
                          });
                        });
                    }}
                  />
                ) : null}

                {showItem && displayName ? (
                  <>
                    {previewUrl && coverUpload?.status !== "uploading" ? (
                      <div className={`${styles.preview()} aspect-[16/9] w-full`}>
                        <Image
                          alt=""
                          className={styles.image()}
                          fill
                          sizes="100vw"
                          src={previewUrl}
                        />
                      </div>
                    ) : null}
                    <FileItem
                      fileName={displayName}
                      fileSize={coverUpload?.fileSize}
                      progress={coverUpload?.progress}
                      removeLabel={t("removeUpload")}
                      retryLabel={t("retryUpload")}
                      status={
                        coverUpload?.status === "uploading"
                          ? "uploading"
                          : coverUpload?.status === "error"
                            ? "error"
                            : "success"
                      }
                      statusMessage={
                        coverUpload?.status === "error"
                          ? t("uploadError")
                          : coverUpload?.status === "success" || field.value
                            ? t("uploadSuccess")
                            : undefined
                      }
                      onRemove={() => {
                        setCoverUpload(null);
                        field.onChange(null);
                        setValue("coverFileName", "");
                      }}
                      onRetry={() => {
                        const file = coverUpload?.file;
                        if (!file) return;
                        setCoverUpload({
                          fileName: file.name,
                          fileSize: formatBytes(file.size),
                          status: "uploading",
                          progress: 35,
                          file,
                        });
                        void mediaApi
                          .upload(file)
                          .then((asset) => {
                            setCoverUpload({
                              fileName: file.name,
                              fileSize: formatBytes(file.size),
                              status: "success",
                              progress: 100,
                              file,
                            });
                            field.onChange(asset.id);
                            setValue("coverFileName", file.name);
                          })
                          .catch(() => {
                            setCoverUpload({
                              fileName: file.name,
                              fileSize: formatBytes(file.size),
                              status: "error",
                              progress: 65,
                              file,
                            });
                          });
                      }}
                    />
                  </>
                ) : null}
              </div>
            </div>
          );
        }}
      />

      <div className={styles.group()}>
        <Typography className={styles.groupTitle()} type="body" weight="semibold">
          {t("gallery")}
        </Typography>
        <Typography className={styles.hint()} type="body-sm">
          {t("galleryHint")}
        </Typography>

        <Uploader
          accept={IMAGE_ACCEPT}
          buttonLabel={t("uploaderButton")}
          description={t("uploaderDescription")}
          multiple
          title={t("uploaderTitle")}
          onDropAccepted={(files) => {
            for (const file of files) {
              const tempId =
                typeof crypto !== "undefined" && "randomUUID" in crypto
                  ? crypto.randomUUID()
                  : `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

              setGalleryUploads((prev) => ({
                ...prev,
                [tempId]: {
                  fileName: file.name,
                  fileSize: formatBytes(file.size),
                  status: "uploading",
                  progress: 35,
                  file,
                },
              }));

              void mediaApi
                .upload(file)
                .then((asset) => {
                  setGalleryUploads((prev) => {
                    const next = { ...prev };
                    delete next[tempId];
                    return next;
                  });
                  gallery.append({
                    id: tempId,
                    mediaId: asset.id,
                    fileName: file.name,
                  });
                })
                .catch((err) => {
                  setGalleryUploads((prev) => ({
                    ...prev,
                    [tempId]: {
                      fileName: file.name,
                      fileSize: formatBytes(file.size),
                      status: "error",
                      progress: 65,
                      file,
                    },
                  }));
                  if (err instanceof ApiError) {
                    // surfaced via FileItem status message
                  }
                });
            }
          }}
        />

        <div className={styles.stack()}>
          {Object.entries(galleryUploads).map(([id, upload]) => (
            <FileItem
              key={id}
              fileName={upload.fileName}
              fileSize={upload.fileSize}
              progress={upload.progress}
              removeLabel={t("removeUpload")}
              retryLabel={t("retryUpload")}
              status={upload.status}
              statusMessage={
                upload.status === "error" ? t("uploadError") : undefined
              }
              onRemove={() => {
                setGalleryUploads((prev) => {
                  const next = { ...prev };
                  delete next[id];
                  return next;
                });
              }}
              onRetry={() => {
                const file = upload.file;
                if (!file) return;
                setGalleryUploads((prev) => ({
                  ...prev,
                  [id]: {
                    ...upload,
                    status: "uploading",
                    progress: 35,
                  },
                }));
                void mediaApi
                  .upload(file)
                  .then((asset) => {
                    setGalleryUploads((prev) => {
                      const next = { ...prev };
                      delete next[id];
                      return next;
                    });
                    gallery.append({
                      id,
                      mediaId: asset.id,
                      fileName: file.name,
                    });
                  })
                  .catch(() => {
                    setGalleryUploads((prev) => ({
                      ...prev,
                      [id]: {
                        ...upload,
                        status: "error",
                        progress: 65,
                      },
                    }));
                  });
              }}
            />
          ))}

          {gallery.fields.map((item, index) => {
            const previewUrl = mediaFileUrl(item.mediaId);
            return (
              <div className={styles.stack()} key={item.id}>
                {previewUrl ? (
                  <div className={`${styles.preview()} aspect-[16/9] w-full`}>
                    <Image
                      alt=""
                      className={styles.image()}
                      fill
                      sizes="100vw"
                      src={previewUrl}
                    />
                  </div>
                ) : null}
                <FileItem
                  fileName={item.fileName || "gallery.jpg"}
                  removeLabel={t("removeUpload")}
                  status="success"
                  statusMessage={t("uploadSuccess")}
                  onRemove={() => gallery.remove(index)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
