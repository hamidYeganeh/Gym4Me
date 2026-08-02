import type { FileItemTypeKind } from "./FileItemType.types";

const EXTENSION_TO_TYPE: Record<string, FileItemTypeKind> = {
  pdf: "PDF",
  doc: "DOC",
  docx: "DOC",
  odt: "DOC",
  rtf: "DOC",
  txt: "DOC",
  xls: "XLS",
  xlsx: "XLS",
  csv: "XLS",
  ods: "XLS",
  ppt: "PPT",
  pptx: "PPT",
  odp: "PPT",
  css: "CSS",
  scss: "CSS",
  less: "CSS",
  jpg: "JPG",
  jpeg: "JPG",
  png: "JPG",
  gif: "JPG",
  webp: "JPG",
  svg: "JPG",
  heic: "JPG",
  avif: "JPG",
  psd: "PSD",
  ai: "AI",
  eps: "AI",
  mp4: "MP4",
  mov: "MP4",
  webm: "MP4",
  m4v: "MP4",
  avi: "MP4",
  mkv: "MP4",
  mp3: "MP3",
  wav: "MP3",
  aac: "MP3",
  flac: "MP3",
  m4a: "MP3",
  ogg: "MP3",
};

/** Resolve a Figma file-type kind from a file name or extension. */
export function resolveFileItemType(
  fileNameOrExtension?: string | null,
): FileItemTypeKind {
  if (!fileNameOrExtension) return "DOC";

  const normalized = fileNameOrExtension.trim().toLowerCase();
  const extension = normalized.includes(".")
    ? (normalized.split(".").pop() ?? normalized)
    : normalized.replace(/^\./, "");

  return EXTENSION_TO_TYPE[extension] ?? "DOC";
}
