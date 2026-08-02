import type { Accept, DropEvent, FileRejection } from "react-dropzone";

export interface UploaderProps {
  /** Primary heading. Defaults to "Browse your file to upload!". */
  title?: string;
  /** Helper text under the title. Defaults to supported formats copy. */
  description?: string;
  /** Browse button label. Defaults to "Browse File". */
  buttonLabel?: string;
  /** Called with accepted files (and rejections) after a drop or file pick. */
  onDrop?: (
    acceptedFiles: File[],
    fileRejections: FileRejection[],
    event: DropEvent,
  ) => void;
  /** Called only when files pass accept / size checks. */
  onDropAccepted?: (files: File[], event: DropEvent) => void;
  /** Called only when files are rejected. */
  onDropRejected?: (fileRejections: FileRejection[], event: DropEvent) => void;
  /**
   * Accepted MIME types / extensions.
   * Defaults to SVG, JPG, and PNG.
   */
  accept?: Accept;
  /** Max file size in bytes. Defaults to 10MB. */
  maxSize?: number;
  /** Max number of files. */
  maxFiles?: number;
  /** Allow selecting multiple files. Defaults to `false`. */
  multiple?: boolean;
  /** Disables drag / click interaction. */
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  "aria-label"?: string;
}
