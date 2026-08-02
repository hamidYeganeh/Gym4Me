"use client";

import { Button, Typography } from "@heroui/react";
import { ArrowUpload } from "@repo/icons/ArrowUpload";
import { useCallback, type KeyboardEvent } from "react";
import { useDropzone, type DropEvent, type FileRejection } from "react-dropzone";
import { uploaderVariants } from "./Uploader.styles";
import type { UploaderProps } from "./Uploader.types";

const DEFAULT_ACCEPT = {
  "image/svg+xml": [".svg"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
} as const;

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;

export function Uploader({
  title = "Browse your file to upload!",
  description = "Supported Format: SVG, JPG, PNG (10mb each)",
  buttonLabel = "Browse File",
  onDrop,
  onDropAccepted,
  onDropRejected,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  maxFiles,
  multiple = false,
  disabled = false,
  className,
  buttonClassName,
  "aria-label": ariaLabel,
}: UploaderProps) {
  const handleDrop = useCallback(
    (
      acceptedFiles: File[],
      fileRejections: FileRejection[],
      event: DropEvent,
    ) => {
      onDrop?.(acceptedFiles, fileRejections, event);
    },
    [onDrop],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } =
    useDropzone({
      onDrop: handleDrop,
      onDropAccepted,
      onDropRejected,
      accept,
      maxSize,
      maxFiles,
      multiple,
      disabled,
      noClick: true,
      noKeyboard: true,
    });

  const slots = uploaderVariants({
    isDragActive,
    isDragReject,
    isDisabled: disabled,
  });

  const openPicker = () => {
    if (!disabled) open();
  };

  const handleRootKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  };

  return (
    <div
      {...getRootProps({
        className: slots.root({ className }),
        role: "button",
        tabIndex: disabled ? -1 : 0,
        "aria-disabled": disabled || undefined,
        "aria-label":
          ariaLabel ?? (typeof title === "string" ? title : "Upload file"),
        onClick: openPicker,
        onKeyDown: handleRootKeyDown,
      })}
    >
      <input {...getInputProps()} />

      <div className={slots.content()}>
        <Typography
          type="h5"
          weight="bold"
          align="center"
          className={slots.title()}
        >
          {title}
        </Typography>
        <Typography
          type="body-sm"
          color="muted"
          align="center"
          className={slots.description()}
        >
          {description}
        </Typography>
      </div>

      <Button
        variant="primary"
        size="md"
        isDisabled={disabled}
        className={slots.button({ className: buttonClassName })}
        onPress={openPicker}
        onClick={(event) => event.stopPropagation()}
      >
        {buttonLabel}
        <ArrowUpload className={slots.buttonIcon()} size={20} aria-hidden />
      </Button>
    </div>
  );
}
