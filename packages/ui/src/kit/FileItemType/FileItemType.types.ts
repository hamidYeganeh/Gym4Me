import type { FileItemTypeVariantProps } from "./FileItemType.styles";

export type FileItemTypeKind = NonNullable<FileItemTypeVariantProps["type"]>;
export type FileItemTypeSize = NonNullable<FileItemTypeVariantProps["size"]>;

export interface FileItemTypeProps {
  /** File type badge / glyph. Defaults to `DOC`. */
  type?: FileItemTypeKind;
  /** Icon size matching the Figma scale. Defaults to `md`. */
  size?: FileItemTypeSize;
  /** Accessible label. Defaults to the type name. */
  "aria-label"?: string;
  className?: string;
}
