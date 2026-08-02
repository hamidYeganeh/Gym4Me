import type { ReactNode } from "react";
import type { FileItemTypeKind } from "../FileItemType";
import type { FileItemVariantProps } from "./FileItem.styles";

export type FileItemStatus = NonNullable<FileItemVariantProps["status"]>;

export interface FileItemProps {
  /** Display name of the file. */
  fileName: string;
  /** Upload lifecycle state. */
  status: FileItemStatus;
  /**
   * Explicit file-type icon. When omitted, inferred from `fileName`.
   * Used for the uploading leading icon via `FileItemType`.
   */
  type?: FileItemTypeKind;
  /**
   * Progress from 0–100.
   * Defaults to `0` when uploading, `100` when successful.
   */
  progress?: number;
  /**
   * Left footer text while uploading (e.g. file size).
   * Ignored for success / error unless `statusMessage` is unset and this is provided.
   */
  fileSize?: ReactNode;
  /** Override the default status / meta message. */
  statusMessage?: ReactNode;
  /** Label for the error retry action. Defaults to "Try Again". */
  retryLabel?: string;
  /** Called when the remove / trash control is pressed. */
  onRemove?: () => void;
  /** Called when the error retry control is pressed. */
  onRetry?: () => void;
  /** Accessible label for the remove control. */
  removeLabel?: string;
  className?: string;
}
