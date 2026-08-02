"use client";

import { Button, ProgressBar, Typography } from "@heroui/react";
import { ArrowRotateClockwise1 } from "@repo/icons/ArrowRotateClockwise1";
import { Check } from "@repo/icons/Check";
import { ExclamationMarkTriangle } from "@repo/icons/ExclamationMarkTriangle";
import { Trash1 } from "@repo/icons/Trash1";
import { FileItemType, resolveFileItemType } from "../FileItemType";
import { fileItemVariants } from "./FileItem.styles";
import type { FileItemProps, FileItemStatus } from "./FileItem.types";

const PROGRESS_COLOR: Record<
  FileItemStatus,
  "accent" | "success" | "danger"
> = {
  uploading: "accent",
  success: "success",
  error: "danger",
};

function defaultProgress(status: FileItemStatus, progress?: number) {
  if (progress !== undefined) return progress;
  return status === "success" ? 100 : 0;
}

function defaultStatusMessage(
  status: FileItemStatus,
  fileSize?: FileItemProps["fileSize"],
) {
  if (status === "success") return "Upload Successful!";
  if (status === "error") return "Upload failed! Please try again.";
  return fileSize;
}

export function FileItem({
  fileName,
  status,
  type,
  progress,
  fileSize,
  statusMessage,
  retryLabel = "Try Again",
  onRemove,
  onRetry,
  removeLabel = "Remove file",
  className,
}: FileItemProps) {
  const slots = fileItemVariants({ status });
  const clamped = Math.min(100, Math.max(0, defaultProgress(status, progress)));
  const meta = statusMessage ?? defaultStatusMessage(status, fileSize);
  const showRemove = status !== "success";
  const showRetry = status === "error";
  const fileType = type ?? resolveFileItemType(fileName);

  return (
    <div className={slots.root({ className })} data-status={status}>
      {status === "uploading" ? (
        <FileItemType
          type={fileType}
          size="sm"
          className={slots.typeIcon()}
          aria-label={`${fileType} file`}
        />
      ) : (
        <span aria-hidden className={slots.iconWrap()}>
          {status === "success" ? (
            <Check className={slots.icon()} size={24} />
          ) : (
            <ExclamationMarkTriangle className={slots.icon()} size={24} />
          )}
        </span>
      )}

      <div className={slots.body()}>
        <div className={slots.header()}>
          <Typography
            type="body"
            weight="semibold"
            className={slots.fileName()}
          >
            {fileName}
          </Typography>

          <div className={slots.trailing()}>
            {status === "success" ? (
              <span aria-hidden className={slots.successBadge()}>
                <Check className={slots.successBadgeIcon()} size={12} />
              </span>
            ) : showRemove ? (
              <Button
                aria-label={removeLabel}
                className={slots.removeButton()}
                isIconOnly
                size="lg"
                variant="ghost"
                onPress={onRemove}
              >
                <Trash1 className={slots.trailingIcon()} size={20} />
              </Button>
            ) : null}
          </div>
        </div>

        <ProgressBar
          aria-label={`${fileName} upload progress`}
          className={slots.progress()}
          color={PROGRESS_COLOR[status]}
          value={clamped}
        >
          <ProgressBar.Track className={slots.track()}>
            <ProgressBar.Fill className={slots.fill()} />
          </ProgressBar.Track>
        </ProgressBar>

        <div className={slots.footer()}>
          {meta != null && meta !== "" ? (
            <Typography type="body-sm" className={slots.meta()}>
              {meta}
            </Typography>
          ) : (
            <span />
          )}

          {showRetry ? (
            <Button
              className={slots.retryButton()}
              variant="ghost"
              onPress={onRetry}
            >
              {retryLabel}
              <ArrowRotateClockwise1
                className={slots.retryIcon()}
                size={16}
                aria-hidden
              />
            </Button>
          ) : (
            <Typography type="body-sm" className={slots.percent()}>
              {Math.round(clamped)}%
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
}
