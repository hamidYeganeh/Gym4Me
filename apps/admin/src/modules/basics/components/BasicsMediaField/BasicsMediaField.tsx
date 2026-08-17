import { useState } from "react";
import { Typography } from "@heroui/react";
import { ApiError } from "@repo/api";
import { FileItem, type FileItemStatus } from "@repo/ui/kit/FileItem";
import {
  FileItemType,
  resolveFileItemType,
} from "@repo/ui/kit/FileItemType";
import { Uploader } from "@repo/ui/kit/Uploader";
import { mediaApi } from "@/shared/lib/api";
import { basicsMediaFieldVariants } from "./BasicsMediaField.styles";
import type { BasicsMediaFieldProps } from "./BasicsMediaField.types";

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

const IMAGE_ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/svg+xml": [".svg"],
} as const;

export function BasicsMediaField({
  label,
  hint,
  value,
  onChange,
  disabled,
  fileName: existingFileName,
  uploaderTitle,
  uploaderDescription,
  uploaderButtonLabel,
  successMessage,
  errorMessage,
  retryLabel,
  removeLabel,
}: BasicsMediaFieldProps) {
  const styles = basicsMediaFieldVariants();
  const [upload, setUpload] = useState<UploadState | null>(null);

  const displayName =
    upload?.fileName ?? existingFileName ?? (value ? "media.jpg" : null);
  const fileType = displayName ? resolveFileItemType(displayName) : "JPG";

  const runUpload = async (file: File) => {
    setUpload({
      fileName: file.name,
      fileSize: formatBytes(file.size),
      status: "uploading",
      progress: 35,
      file,
    });

    try {
      const asset = await mediaApi.upload(file);
      setUpload({
        fileName: file.name,
        fileSize: formatBytes(file.size),
        status: "success",
        progress: 100,
        file,
      });
      onChange(asset.id);
    } catch (err) {
      setUpload({
        fileName: file.name,
        fileSize: formatBytes(file.size),
        status: "error",
        progress: 65,
        file,
      });
      if (err instanceof ApiError) {
        // keep FileItem error message via props
      }
    }
  };

  const clear = () => {
    setUpload(null);
    onChange(null);
  };

  const showUploader = !value && (!upload || upload.status === "error");
  const showItem =
    Boolean(value) ||
    (upload != null &&
      (upload.status === "uploading" ||
        upload.status === "success" ||
        upload.status === "error"));

  return (
    <div className={styles.root()}>
      <Typography className={styles.label()}>{label}</Typography>
      {hint ? <Typography className={styles.hint()}>{hint}</Typography> : null}

      <div className={styles.stack()}>
        {showUploader ? (
          <Uploader
            accept={IMAGE_ACCEPT}
            buttonLabel={uploaderButtonLabel}
            description={uploaderDescription}
            disabled={disabled}
            maxFiles={1}
            multiple={false}
            title={uploaderTitle}
            onDropAccepted={(files) => {
              const file = files[0];
              if (file) void runUpload(file);
            }}
          />
        ) : null}

        {showItem && displayName ? (
          <>
            {value && upload?.status !== "uploading" ? (
              <div className={styles.preview()}>
                <img
                  alt=""
                  className={styles.image()}
                  src={mediaApi.fileUrl(value)}
                />
                <div className={styles.typeWrap()}>
                  <FileItemType
                    aria-label={fileType}
                    size="sm"
                    type={fileType}
                  />
                </div>
              </div>
            ) : null}

            <FileItem
              fileName={displayName}
              fileSize={upload?.fileSize}
              progress={upload?.progress}
              removeLabel={removeLabel}
              retryLabel={retryLabel}
              status={
                upload?.status ?? (value ? "success" : "uploading")
              }
              statusMessage={
                upload?.status === "error"
                  ? errorMessage
                  : upload?.status === "success" || value
                    ? successMessage
                    : undefined
              }
              type={fileType}
              onRemove={disabled ? undefined : clear}
              onRetry={
                upload?.status === "error" && upload.file
                  ? () => void runUpload(upload.file!)
                  : undefined
              }
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
